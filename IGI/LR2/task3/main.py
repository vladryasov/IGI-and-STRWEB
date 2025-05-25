import os

from geometric_lib.square import area as sq_area, perimeter as sq_perim
from geometric_lib.circle import area as circ_area, perimeter as circ_perim

def main():
    shape = os.getenv('SHAPE')
    
    if shape == "circle":
        radius = float(os.getenv('RADIUS'))
        print("area: ", circ_area(radius))
        print("perimetr: ", circ_perim(radius))
        
    elif shape == "square":
        side = float(os.getenv('SIDE'))
        print("area: ", sq_area(side))
        print("perimetr: ", sq_perim(side))
        
if __name__ == '__main__':
    main()
