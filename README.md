# Le QG

A React Native application to find beers near you, on a map.

## Setup

- `yarn`
- `cp .env.sample .env`

### Mapbox

1. Create an account https://account.mapbox.com/
2. Create one public and one secret token
3. Set public token into `.env` file for `MAPBOX_API_KEY`
4. Create a `.netrc` file into your home directory: `touch ~/.netrc` and add

```
machine api.mapbox.com
login mapbox
password YOUR_MAPBOX_SECRET_TOKEN
```

### Android

- `yarn android`

### iOS

- `cd ios`, `pod install`
- `yarn ios`

# Concepts

- Map
  - [x] Display store on map
  - [x] Price of the cheapest beer
  - [x] Store name when zoom
  - [x] Search store by name
  - [ ] Search address
  - [ ] Only display store type (pub/cave/...)
  - Filters:
    - Price:
      - [x] Min - max price with rheostats
      - [x] Display average price
      - [ ] Display rheostat and average only on visible stores
      - [ ] Choose displaying local or user currency
    - Beer:
      - [x] Display only stores with a beer
      - [x] Search beer
      - [x] Choose different beers
      - [x] Display price of cheapest choosed beers
      - [x] Choose operator AND/OR if selected multiple beers
      - [ ] Filter by type
    - Schedule:
      - [x] Display only open stores, now
      - [ ] Choose a different date and hour
    - Features:
      - [x] Display only stores with features
      - [ ] Choose operator AND/OR if selected multiple features
    - Rates:
      - [ ] Min - max rate

- Users
  - [x] Signup, signin, reset password
  - [x] Choose favorite currency
  - [x] Have contribution/reputation
  - [x] Read contribution/reputation history
  - [ ] Edit their profile
  - [ ] Edit their photo 

- Stores
  - [x] Name
  - [x] Address
  - [x] Products
  - [x] Schedules
  - [x] Website
  - [x] Phone
  - [x] Features
  - [ ] Photos
  - [ ] Rate
  - [ ] Type (pub/cave/...)
  - [ ] Users could validate store
  - [ ] Flag store as closed/duplicate

- Features
  - [ ] Add new one

- Products
  - [ ] Add new one
  - [ ] Photo
  - [ ] Description
  - [ ] Rates
  - [ ] Stats on price, countries, ...
  - [ ] Type (beer/wine/cocktail/boards/...)

- ...
