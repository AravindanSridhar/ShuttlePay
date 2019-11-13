#!/usr/bin/env python
import requests
import json
# import RPi.GPIO as GPIO
# from mfrc522 import SimpleMFRC522


# reader = SimpleMFRC522()

# try:
#     id, text = reader.read()
#     url = "http://40.122.70.180/api/pay"
#     data = {'rfuid': id, 'routeID': 1, 'cabID': 2}
#     r = requests.post(url=url, data=data)
#     print(r.text)
# finally:
#     GPIO.cleanup()
import tkinter
m=tkinter.Tk()
m.geometry('500x500')
w = tkinter.Message(m, text="Shuttle Pay", font=("",30), width = 350,fg="orange")
w.config(bg='#0A0B3C') 
w.pack( ) 
m.mainloop()
