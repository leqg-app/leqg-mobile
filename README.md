# Le QG

A React Native application to find beers near you, on a map.

## Setup

- `yarn`
- Fill `.env` with `.env.sample` with your own API keys

### Android

- `yarn react-native run-android`

### iOS

- `cd ios`, `pod install`
- `yarn react-native run-ios`

# Concepts

- Map
  - [x] Display store on map
  - [x] Price of the cheapest beer
  - [x] Store name when zoom
  - [ ] Only display store type (pub/cave/...)
  - [ ] Search store by name
  - [ ] Search address
  - Filters:
    - Price:
      - [x] Min - max price with rheostats
      - [x] Display average price
      - [ ] Display rheostat and average only on visible stores
      - [ ] Choose displaying local or user currency
    - Beer:
      - [x] Display only stores with a beer
      - [ ] Search beer
      - [ ] Choose different beers
      - [ ] Display price of cheapest choosed beers
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
  - [ ] Edit their profile
  - [ ] Edit their photo 
  - [ ] Read contribution/reputation history

- Stores
  - [x] Name
  - [x] Address
  - [x] Products
  - [x] Schedules
  - [ ] Website
  - [ ] Phone
  - [ ] Features
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
