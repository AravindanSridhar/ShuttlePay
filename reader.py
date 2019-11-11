#!/usr/bin/env python
import requests
import json
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522


reader = SimpleMFRC522()

try:
    id, text = reader.read()
    url = "http://40.122.70.180/api/pay"
    data = {'rfuid': id, 'routeID': 1, 'cabID': 2}
    r = requests.post(url=url, data=data)
    print(r.text)
finally:
    GPIO.cleanup()
