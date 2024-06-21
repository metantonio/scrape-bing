# Bot to Scrape simulating navigation with Chrome browser (with Node) and Edge Browser (with Python)

Some websites uses anti-scrape techniques, and the only way to scrape data is simulating navigation.

Microsoft edge driver, if dont have download it from https://developer.microsoft.com/zh-cn/microsoft-edge/tools/webdriver/?form=MA13LH#downloads

## Scraping from Vegas Restaurants from MGM Resorts

### Website
- [MGM Resort](https://www.mgmresorts.com/)

### Run Code

For node scripts, please adjust the **Chrome browser path at utils.js and powerball_utils.js**

```bash
node mgm.js mgm
```

## Scraping horse-racing tracks from Twinspires

### Website
- [Twinspires](https://www.twinspires.com/edge/racing/tracks/belmont-park/)

### Run Code

For node scripts, please adjust the **Chrome browser path at utils.js and powerball_utils.js**

```bash
node tracks.js tracks
```

## Scraping nerby restaurant from Bing Maps (in development)

## Scraping Poker Atlas

### Run Code

For node scripts, please adjust the **Chrome browser path at utils.js and powerball_utils.js**

```bash
node pokeratlas.js pokeratlas
```

## Scraping Powerball

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