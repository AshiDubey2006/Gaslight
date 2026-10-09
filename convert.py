from PIL import Image

try:
    img = Image.open('c:/Users/Slim3/OneDrive/Desktop/gaslight-exe-hehe/icons/crazy_icon.jpg')
    img.save('c:/Users/Slim3/OneDrive/Desktop/gaslight-exe-hehe/icons/crazy_icon.png')
    print("Successfully converted image to PNG.")
except Exception as e:
    print(f"Error converting image: {e}")
