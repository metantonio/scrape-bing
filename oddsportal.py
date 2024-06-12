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

# Create service for microsoft edge
service = Service(verbose = True)
options = Options()
options.binary_location = r".\msedgedriver.exe"
driver = webdriver.Edge()


url = "https://www.oddsportal.com/football/usa/mls/"

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