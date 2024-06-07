import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.action_chains import ActionChains
import re
import json
from bs4 import BeautifulSoup as soup #pip install beautifulsoup4
from bs4 import SoupStrainer

service = Service(verbose = True)

options = Options()
options.binary_location = r".\msedgedriver.exe"
driver = webdriver.Edge()

# Abre Excel file
file_path = r".\bingloterry.csv"
df = pd.read_csv(file_path)

# Crea una nueva columna para las direcciones
df["AG"] = ""

# Itera a través de las filas del DataFrame
for index, row in df.iterrows():
    name = row['Search']
    new_latitude = row['Latitude']
    new_longitude = row['Longitude']
    state = row['State']
    city = row['City']
    checked = row['found']
    if checked != "true":
        # Abre Google Maps y busca el casino
        url = f"https://www.google.com/maps/search/{name}+{state}"
        #url = f"https://www.bing.com/maps/?cp={new_latitude}%7E{new_longitude}&lvl=17.4"
        driver.get(url)

        # Espera a que la página cargue completamente (puedes ajustar el tiempo si es necesario)
        driver.implicitly_wait(10)
        # Obtén el tamaño de la ventana del navegador
        """ window_size = driver.get_window_size()

        # Calcula las coordenadas del centro de la ventana
        center_x = window_size['width'] / 2
        center_y = window_size['height'] / 2

        # Intenta encontrar la dirección en la página
        # Obtén la URL actual del navegador
        # Mueve el cursor al centro de la pantalla
        ActionChains(driver).move_by_offset(center_x, center_y).click().perform()
        current_url = driver.current_url """
        current_url_before_click = driver.current_url

        # Hacer clic en cualquier parte de la pantalla (por ejemplo, el centro)
        driver.find_element(By.TAG_NAME, 'body').click()

        # Espera un momento para que ocurra la interacción y la nueva URL se cargue
        time.sleep(2)  # Ajusta el tiempo según sea necesario

        # Obtén la nueva URL actual después de hacer clic
        current_url_after_click = driver.current_url

        # Compara las URLs para asegurarte de que haya cambiado
        if current_url_before_click != current_url_after_click:
            # La URL ha cambiado, puedes imprimir o usar current_url_after_click como lo necesites
            #print("Nueva URL:", current_url_after_click)
            current_url = current_url_after_click
        else:
            current_url = current_url_after_click
            #print("La URL no ha cambiado después de hacer clic")
        try:           
            # Esperar un breve momento para que se copie la dirección en el portapapeles (ajusta según sea necesario)
            time.sleep(2)
            current_url = driver.current_url
            print("current_url: ", current_url)
            #print(current_url)
            time.sleep(1)

            match = re.search(r'@([+-]?\d+\.\d+),([+-]?\d+\.\d+)', current_url)
            latitude = 0
            longitude = 0
            if match:
                latitude = float(match.group(1))
                longitude = float(match.group(2))
                df.at[index, 'found'] = "true"
            # Almacena la latitud y la longitud en el DataFrame
            df.at[index, 'Latitude'] = latitude
            df.at[index, 'Longitude'] = longitude
            
            df.to_csv(file_path, index=False)

            #print(row)
            print(f"Name: {row['Search']}, State: {row['State']}, Latitude: {latitude}, Longitude: {longitude}, AG: {row['AG']}")
        except Exception as e:
            print(str(e))
            #print(f"No se pudo encontrar la dirección para en {state}: {e}")
        
        #print(df[['Name', 'Latitude', 'Longitude', 'AG']])      

# Cierra el navegador
time.sleep(5)
driver.quit()

# Guarda los cambios en el Excel file
df.to_csv(file_path, index=False)