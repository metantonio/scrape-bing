import pandas as pd  # pip install pandas
from selenium import webdriver  # pip install selenium
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.action_chains import ActionChains
import re
import json
from bs4 import BeautifulSoup as soup  # pip install beautifulsoup4
from bs4 import SoupStrainer

service = Service(verbose=True)

options = Options()
options.binary_location = r".\msedgedriver.exe"
driver = webdriver.Edge()

# Abre Excel file
file_path = r".\bingloterry.csv"
file_path_results = r".\bingloterry_results.csv"
df = pd.read_csv(file_path)
df_results = pd.read_csv(file_path_results)

# Crea una nueva columna para las direcciones
df["AG"] = ""

# Itera a través de las filas del DataFrame
for index, row in df.iterrows():
    name = row["Search"]
    # new_latitude = row['Latitude']
    # new_longitude = row['Longitude']
    state = row["State"]
    city = row["City"]
    checked = row["found"]
    if checked != "true":
        # Abre Google Maps y busca el casino
        url = f"https://www.google.com/maps/search/{name}+{state}"
        driver.get(url)

        # Espera a que la página cargue completamente (puedes ajustar el tiempo si es necesario)
        driver.implicitly_wait(10)

        current_url_before_click = driver.current_url

        # Hacer clic en cualquier parte de la pantalla (por ejemplo, el centro)
        driver.find_element(By.TAG_NAME, "body").click()

        # Espera un momento para que ocurra la interacción y la nueva URL se cargue
        time.sleep(2)  # Ajusta el tiempo según sea necesario

        # Obtén la nueva URL actual después de hacer clic
        current_url_after_click = driver.current_url

        # Compara las URLs para asegurarte de que haya cambiado
        if current_url_before_click != current_url_after_click:
            # La URL ha cambiado, puedes imprimir o usar current_url_after_click como lo necesites
            # print("Nueva URL:", current_url_after_click)
            current_url = current_url_after_click
        else:
            current_url = current_url_after_click
            # print("La URL no ha cambiado después de hacer clic")
        try:
            # Esperar un breve momento para que se copie la dirección en el portapapeles (ajusta según sea necesario)
            time.sleep(2)
            current_url = driver.current_url
            print("current_url: ", current_url)
            # print(current_url)
            time.sleep(1)
            # .fontHeadlineSmall #Contiene los nombres de las tiendas de loterry
            # .section-subtitle-extension #el 2do  div hermano contiene la información de dirección

            # Extrae el contenido de la página
            page_source = driver.page_source
            page_soup = soup(page_source, "html.parser")

            # Encuentra los nombres de las tiendas
            store_names = [
                store.get_text()
                for store in page_soup.find_all("div", class_="fontHeadlineSmall")
            ]

            # Encuentra las direcciones
            address_elements = page_soup.find_all(
                "div", class_="section-subtitle-extension"
            )
            addresses = []
            for element in address_elements:
                # Obtiene dos divs hermanos después del actual
                sibling = element.find_next_siblings("div", limit=2)
                if len(sibling) >= 2:
                    address = sibling[1].get_text() + " "  # Segundo hermano
                    addresses.append(address)

            print(f"Store Names: {store_names}")
            print(f"Addresses: {addresses}")

            # Actualiza el DataFrame con los nombres y direcciones encontrados
            for store_name, address in zip(store_names, addresses):
                new_row = pd.DataFrame(
                    {"Name": [store_name], "Detail": [address], "URL": [current_url]}
                )
                df_results = pd.concat([df_results, new_row], ignore_index=True)

            match = re.search(r"@([+-]?\d+\.\d+),([+-]?\d+\.\d+)", current_url)
            latitude = 0
            longitude = 0
            if match:
                latitude = float(match.group(1))
                longitude = float(match.group(2))
                # df.at[index, 'found'] = "true"
            # Almacena la latitud y la longitud en el DataFrame
            df_results.at[index, "URL"] = current_url
            # df_results.at[index, 'Longitude'] = longitude
            # df_results.at[index, 'Latitude'] = longitude

            df_results.to_csv(file_path_results, index=False)

            # print(f"Name: {row['Search']}, State: {row['State']}, Latitude: {latitude}, Longitude: {longitude}, AG: {row['AG']}")
        except Exception as e:
            print(str(e))

# Cierra el navegador
time.sleep(5)
driver.quit()

# Elimina filas duplicadas basadas en 'Store_Name' y 'Detail'
df_results = df_results.drop_duplicates(subset=["Detail"])

# Guarda los cambios en el Excel file
df_results.to_csv(file_path_results, index=False)
