import pandas as pd #pip install pandas
from selenium import webdriver #pip install selenium
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
import requests

# Create service for microsoft edge driver, if dont have download it from https://developer.microsoft.com/zh-cn/microsoft-edge/tools/webdriver/?form=MA13LH#downloads
# and change the path to the microsoft edge driver, but easily put the driver in the same directory of this script
service = Service(verbose = True)
options = Options()
options.binary_location = r".\msedgedriver.exe"
driver = webdriver.Edge()


url = "https://www.oddsportal.com/football/usa/mls/"

#Go to the website, will open microsoft edge driver
driver.get(url)

# Just a waiting time to load content of the website
driver.implicitly_wait(10)

#obtain URL just to compare
current_url_before_click = driver.current_url

try:
    time.sleep(2)
    current_url = driver.current_url
    print("current_url: ", current_url)

    # Parsing the context
    page_source = driver.page_source
    page_soup = soup(page_source, "html.parser")

    # find all div with the following class that contains the div with the "table" but it has more div
    pseudo_table = page_soup.find("div", class_="min-h-[86px]")

    # select the next inner div that has the table
    child_divs = pseudo_table.find("div", recursive=False)

    #print("table: \n", child_divs)
    
    data = []

    
    if child_divs:
        internal_divs = child_divs.find_all("div", recursive=False)
        for internal_div in internal_divs:
            # iterate over the children looking for the class "bg-gray-light" (bootstrap) because contains the date
            gray_light_div = internal_div.find("div", class_=lambda x: x and "bg-gray-light" in x.split())
            if gray_light_div:
                date_div = gray_light_div.find("div", recursive=False)
                #print(gray_light_div)
                date = date_div.text.strip()  # Suponiendo que la fecha está en texto plano dentro del div
                data.append(date)

    print(data)


except Exception as error:
    print("Error browsing: ", str(error))

response = requests.get(url)
print(response)
if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'lxml')
   
    table = soup.find('table', class_='table-main')
    pseudo_table = soup.find('div', class_='min-h-[86px]')
    print(pseudo_table)
    data = []
   
    if table:
        rows = table.find_all('tr')
       
        for row in rows[1:]:  
            cols = row.find_all(['td', 'th'])
            if len(cols) >= 5:  
                date = cols[0].text.strip()
                teams = cols[1].text.strip()
                odds_1 = cols[2].text.strip()
                odds_x = cols[3].text.strip()
                odds_2 = cols[4].text.strip()
               
                data.append([date, teams, odds_1, odds_x, odds_2])

        df = pd.DataFrame(data, columns=['Date', 'Teams', '1', 'X', '2'])
       
        file_path = r"./MLS_betting_odds.xlsx"
       
        df.to_excel(file_path, index=False)

        print("Data extracted and saved to MLS_betting_odds.xlsx file.")
    else:
        print("Table not found. Please check if the website structure has changed.")
else:
    print("Failed to retrieve data. Status code:", response.status_code)