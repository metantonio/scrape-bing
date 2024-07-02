# Bot to Scrape simulating navigation with Chrome browser (with Node) and Edge Browser (with Python)

Some websites uses anti-scrape techniques, and the only way to scrape data is simulating navigation.

This repository has scripts that works with Python, and anothers with Javascript.

Microsoft edge driver, if dont have download it from https://developer.microsoft.com/zh-cn/microsoft-edge/tools/webdriver/?form=MA13LH#downloads

# 1. Python Installation

### 1.1 Windows

There are 2 ways to install Python, globally or into a local environment.

### 1.1.A Python globally (Easy way):
- [Python 3.11.6](https://www.python.org/downloads/release/python-3116/)

### 1.1.1.B Python local environment (optional but recommended):

If you want to control the Python version to use and change between others:
- Install pyenv (windows), you need run ***powershell with Administrator rights***:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
 - Press `A`, then try to install pyenv.

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/pyenv-win/pyenv-win/master/pyenv-win/install-pyenv-win.ps1" -OutFile "./install-pyenv-win.ps1"; &"./install-pyenv-win.ps1"
```

 - You may need to add `pyenv` to environment PATH, in order to be able to use `pyenv` command. And open a new **Powershell** window

 - Install Python Version:

```sh
pyenv install 3.11.6
```

- Use Python Version locally in this project (you should run this command in the root of this project):

```sh
pyenv local 3.11.6
```

- Use Python Version globally by default:

```sh
pyenv global 3.11.6
```

# 2. Node Installation

- Make sure you are using node.js LTS version >= 20.x+ Link: [node v20.9.0 LTS](https://nodejs.org/dist/v20.9.0/node-v20.9.0-x64.msi)

### 2.1 Install the packages (just need to do this the first time):

- Install the libraries of this project. Run this command in the root of this project

```bash
npm install --legacy-peer-deps
```

# Scraping from Vegas Restaurants from MGM Resorts

### Website
- [MGM Resort](https://www.mgmresorts.com/)

### Run Code

For node scripts, please adjust the **Chrome browser path at utils.js and powerball_utils.js**

```bash
node mgm.js mgm
```

# Scraping horse-racing tracks from Twinspires

### Website
- [Twinspires](https://www.twinspires.com/edge/racing/tracks/belmont-park/)

### Run Code

For node scripts, please adjust the **Chrome browser path at utils.js and powerball_utils.js**

```bash
node tracks.js tracks
```

<!-- # Scraping nerby restaurant from Bing Maps (in development) -->

# Scraping Poker Atlas

### Run Code

For node scripts, please adjust the **Chrome browser path at utils.js and powerball_utils.js**

```bash
node pokeratlas.js pokeratlas
```

# Scraping Powerball

### Run Code

For node scripts, please adjust the **Chrome browser path at utils.js and powerball_utils.js**

```bash
node powerball.js powerball
```

# Scrapping Loterry Retailers with Bing and Python:

You should add the search "keyword" and city, at **bingloterry.csv**

```bash
pip install bs4 pandas selenium
```

```bash
python bingloterry.py
```

You will obtain the results at **bingloterry_results.csv**

# Scrapping MLS betting odd with Bing and Python:

### Website
- [MLS odds](https://www.oddsportal.com/football/usa/mls/)


```bash
pip install bs4 pandas selenium
```

```bash
python oddsportal.py
```