#!/usr/bin/env python
import requests
import time
import json
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522

url = 'http://192.168.1.11:5000/api/pay'


reader = SimpleMFRC522()

try:
    id, text = reader.read()
    data = {'rfuid': text, 'routeID': 1, 'cabID': 2}
    r = requests.post(url=url, data=data)
    print(r.text)

finally:
    GPIO.cleanup()
