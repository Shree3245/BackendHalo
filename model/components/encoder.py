from model import Autoencoder
from utils.training import *
import torchvision.transforms.functional as TF
import numpy as np
from PIL import Image
from utils.data.bitstring import *
import lzma
import json
class Encoder():
    def __init__(self, path):
        self.model = Autoencoder().float()  
        self.model.eval()
        checkpoint = load_checkpoint(path)
        self.model.load_state_dict(checkpoint['model_state'])

    def compress(self,path):
        img = Image.open(path).convert('RGB')
        width, height = img.size
        dw = 32 - (width%32)
        dh = 32 - (height%32)
        img = TF.pad(img,(dw,dh,0,0))
        x =  TF.to_tensor(img)
        x = x.unsqueeze(0)
        x = self.model.enc(x)
        x = self.model.binarizer(x)
        
        y = x.cpu().detach().numpy()
        y[y<0] = 0
        y[y>0] = 1
        return y,dw,dh
    def encode_and_save(self, in_path, out_path):
        y,dw,dh = self.compress(in_path)
        comp_dw = BitArray(uint=dw,length=8)
        comp_dh = BitArray(uint=dh,length=8)
        comp_S2 = BitArray(uint=y.shape[2],length = 16)
        comp_S3 = BitArray(uint = y.shape[3],length=16)

        y = y.ravel()
        comp_y = BitArray(y)
        # print(comp_y.bin[:200])
        with lzma.open(out_path , 'wb', preset=9) as fp:
            fp.write(comp_dw.tobytes())
            fp.write(comp_dh.tobytes())
            fp.write(comp_S2.tobytes())
            fp.write(comp_S3.tobytes())
            fp.write(comp_y.tobytes())
        # with ZipFile('%s.zip'%out_path,'w') as zip:
        #     zip.write(out_path)