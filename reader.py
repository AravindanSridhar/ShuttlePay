import tkinter as tk
import requests
import time
import json

r = tk.Tk()
url = 'http://localhost:5000/test2'

t1 = time.asctime(time.localtime(time.time()))
data = {'rfuid': '655781820906', 'timestamp': t1}

r.geometry('500x500')
r.title('Shuttle Pay Terminal')
r.bind('<Escape>', lambda e: r.destroy())

panel = tk.Frame(r, height=500, pady=10, background="#03A9F4")
panel.pack_propagate(0)

panelTitle = tk.Button(panel, font='verdana 25 bold', fg='white', relief='flat',
                       bg="#FFEB3F", text="Shuttle Pay")
panelTitle.pack(side="top")


panel.pack(fill='x')
statusGreen = tk.Button(panel, font='verdana 25 bold', fg='white', relief='flat',
                        bg="green", text="Paid")
statusGreen.pack()


def task():

    statusRed = tk.Button(panel, font='verdana 25 bold', fg='white', relief='flat',
                          bg="red", text="Not Paid")
    statusGreen.pack()
    result = requests.post(url=url, data=data)
    result = json.loads(result.text)
    # if result['status'] == 'yes':

    # else:
    #     statusRed.pack()
    # statusRed.pack_forget()
    statusGreen.pack_forget()
    r.after(2000, task)


r.after(2000, task)

r.mainloop()


# print(result)
