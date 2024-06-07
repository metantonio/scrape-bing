# Bot to Scrape simulating navigation with Chrome browser

Some websites uses anti-scrape techniques, and the only way to scrape data is simulating navigation.

## Scraping from Vegas Restaurants from MGM Resorts

### Website
- [MGM Resort](https://www.mgmresorts.com/)

### Run Code
```bash
node mgm.js mgm
```

## Scraping horse-racing tracks from Twinspires

### Website
- [Twinspires](https://www.twinspires.com/edge/racing/tracks/belmont-park/)

### Run Code
```bash
node tracks.js tracks
```

## Scraping nerby restaurant from Bing Maps (in development)

## Scraping Poker Atlas

### Run Code
```bash
node pokeratlas.js pokeratlas
```

## Scraping Powerball

### Run Code
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