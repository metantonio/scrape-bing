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
        date=""
        for internal_div in internal_divs:

            # iterate over the children looking for the class "bg-gray-light" (bootstrap) because contains the date
            gray_light_div = internal_div.find("div", class_=lambda x: x and "bg-gray-light" in x.split())            
            if gray_light_div:
                date_div = gray_light_div.find("div", recursive=False)
                #print(gray_light_div)
                date = date_div.text.strip()  # Suponiendo que la fecha está en texto plano dentro del div
                #data.append(date)

            # iterate over the children looking for the class "hover:bg-[#f9e9cc]" because it contains the remaining data
            row_data_div = internal_div.find_all("div", class_=lambda x: x and "hover:bg-[#f9e9cc]" in x.split(), recursive=True)
            
            if row_data_div:
                for unique_row_data in row_data_div:
                    div_data = unique_row_data.find("div", class_="group flex")
                    hour = ""
                    teams = ""
                    #obtaining the data, first tag is an anchor <a> with 2 inner div:
                    if div_data:
                        anchor = div_data.find("a")
                        if anchor:
                            hour = anchor.find("div", class_=lambda x: x and "text-[12px]" in x.split()).text.strip()
                            teams = anchor.find("div", class_=lambda x: x and "leading-[16px]" in x.split()).text.strip()
                    
                        
                        # Obtain all sibling
                        all_divs_siblings = div_data.find_all("div", recursive=False)
                        odds_1=""
                        odds_2=""
                        odds_x=""
                        odds_bs=""
                        if len(all_divs_siblings) > 3:  
                            
                            odds_1 = all_divs_siblings[0].text.strip()  # 2n
                            odds_x = all_divs_siblings[1].text.strip()  # 3rd
                            odds_2 = all_divs_siblings[2].text.strip()  # 4th
                            odds_bs = all_divs_siblings[3].text.strip()  
                        data.append([date+" "+hour, teams,odds_1, odds_x, odds_2, odds_bs])

            df = pd.DataFrame(data, columns=['Date', 'Teams', '1', 'X', '2', 'Bs'])
       
            file_path = r"./MLS_betting_odds.xlsx"
            file_path2 = r".\MLS_betting_odds.csv"
            df.to_excel(file_path, index=False)
            df.to_csv(file_path2, index=False)           

    print(data)


except Exception as error:
    print("Error browsing: ", str(error))
