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
file_path = r".\seach_parameters.csv"
file_path_results = r".\search_results.csv"
df = pd.read_csv(file_path)
df_results = pd.read_csv(file_path_results)

# Create a new column that will be used for address
df["AG"] = ""

# loop each row of the Dataframe
for index, row in df.iterrows():
    name = row["Search"]
    state = row["Location"]    
    checked = row["find"]
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
            # .fontHeadlineSmall # This is the main css class that contains the name of the places
            # .section-subtitle-extension #el 2do  div hermano contiene la información de dirección

            # Extract website's content
            page_source = driver.page_source
            page_soup = soup(page_source, "html.parser")

            # Find names of items, on google maps use to be in the class .fontHeadlineSmall
            store_elements = driver.find_elements(By.CLASS_NAME, "fontHeadlineSmall")
            store_names = []
            alt_texts = []
            hrefs = []

            # Use ActionChains to hover over each element and capture the alt text
            for store_element in store_elements:
                action = ActionChains(driver)
                action.move_to_element(store_element).perform()
                time.sleep(1)  # Adjust sleep time as necessary
                #alt_text = store_element.get_attribute("alt")
                store_names.append(store_element.text)

                # Navigate to the grandparent element, then to the sibling with the href attribute
                #href_element = store_element.find_element(By.XPATH, "../../../../../../../following-sibling::a")
                try:                
                    href_element = store_element.find_element(By.XPATH, "../../../../../../../../a") #../../preceding-sibling::div[2]//a
                    
                    if href_element:
                        href = href_element.get_attribute("href")
                        print("href: ", href)
                        hrefs.append(href)
                    else:
                        print("not found href")
                        hrefs.append("")
                    #href = store_element.find_element(By.XPATH, "..").get_attribute("href")
                    """ if alt_text:
                        alt_texts.append(alt_text)
                    else:
                        alt_texts.append("") """
                except Exception as err:
                    print(str(err))
                    hrefs.append("")
                    alt_texts.append("")                

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

            #print(f"Store Names: {store_names}")
            #print(f"Addresses: {addresses}")

            # Update the dataframe
            for store_name, address, href in zip(store_names, addresses, hrefs):
                #match = re.search(r"@([+-]?\d+\.\d+),([+-]?\d+\.\d+)", href)
                match1 = re.compile(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)")
                match = match1.search(href)
                latitude = 0 # Default coordinate is gonna be zero if is not found on the href link
                longitude = 0
                if match:
                    latitude = float(match.group(1))
                    longitude = float(match.group(2))
                new_row = pd.DataFrame(
                    {"Name": [store_name], "Detail": [address], "href": [href], "latitude":latitude, "longitude": longitude}
                )
                
                df_results = pd.concat([df_results, new_row], ignore_index=True)
            
            df_results.to_csv(file_path_results, index=False)
        except Exception as e:
            print(str(e))

# Close the browser
time.sleep(5)
driver.quit()

# Delete duplicate rows with the same 'Detail'
df_results = df_results.drop_duplicates(subset=["Detail"])

# Save changes in a csv file
df_results.to_csv(file_path_results, index=False)
