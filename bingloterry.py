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

# open Excel file
file_path = r".\bingloterry.csv"
file_path_results = r".\bingloterry_results.csv"
df = pd.read_csv(file_path)
df_results = pd.read_csv(file_path_results)

# Create a new column that will be used for address
df["AG"] = ""

# loop each row of the Dataframe
for index, row in df.iterrows():
    name = row["Search"]
    state = row["State"]
    city = row["City"]
    checked = row["found"]
    if checked != "true":
        # Open google Maps and try to find the keyword and the state
        url = f"https://www.google.com/maps/search/{name}+{state}"
        driver.get(url)

        # Wait until the website is loaded (you can adjust this value in seconds)
        driver.implicitly_wait(10)

        current_url_before_click = driver.current_url

        # It will make a click in the screen (normal thing to do when scraping with browsers)
        driver.find_element(By.TAG_NAME, "body").click()

        # wait for the interaction of the previous click
        time.sleep(2)

        # Obtain the new URL after the click was made (some website change it)
        current_url_after_click = driver.current_url

        # Compare URLs
        if current_url_before_click != current_url_after_click:
            # La URL ha cambiado, puedes imprimir o usar current_url_after_click como lo necesites
            # print("Nueva URL:", current_url_after_click)
            current_url = current_url_after_click
        else:
            current_url = current_url_after_click
            # print("La URL no ha cambiado después de hacer clic")
        try:
            # Start the webscraping process
            time.sleep(2)
            current_url = driver.current_url
            print("current_url: ", current_url) # The current URL where we gonna start the scraping
            # print(current_url)
            time.sleep(1)
            # .fontHeadlineSmall #Contiene los nombres de las tiendas de loterry
            # .section-subtitle-extension #el 2do  div hermano contiene la información de dirección

            # Extract website's content
            page_source = driver.page_source
            page_soup = soup(page_source, "html.parser")

            # Find names of items, on google maps use to be in the class .fontHeadlineSmall
            store_names = [
                store.get_text()
                for store in page_soup.find_all("div", class_="fontHeadlineSmall")
            ]

            # Find addresses
            address_elements = page_soup.find_all(
                "div", class_="section-subtitle-extension"
            )
            addresses = []
            for element in address_elements:
                # Need more information that are in siblings div of addresses divs
                sibling = element.find_next_siblings("div", limit=2)
                if len(sibling) >= 2:
                    address = sibling[1].get_text() + " "  # 2nd sibling
                    addresses.append(address)

            print(f"Store Names: {store_names}")
            print(f"Addresses: {addresses}")

            # Update the dataframe
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
            # Saved the URLs of the current search that gave us a series of places
            df_results.at[index, "URL"] = current_url
            # df_results.at[index, 'Longitude'] = longitude
            # df_results.at[index, 'Latitude'] = longitude

            df_results.to_csv(file_path_results, index=False)

            # print(f"Name: {row['Search']}, State: {row['State']}, Latitude: {latitude}, Longitude: {longitude}, AG: {row['AG']}")
        except Exception as e:
            print(str(e))

# Close the browser
time.sleep(5)
driver.quit()

# Delete duplicate rows with the same 'Detail'
df_results = df_results.drop_duplicates(subset=["Detail"])

# Save changes in a csv file
df_results.to_csv(file_path_results, index=False)
