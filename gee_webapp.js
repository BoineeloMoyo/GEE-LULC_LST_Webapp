/*******************************************************************************
 * A section to define information about the data being presented in your app.
 *
 * Use this section to import assets and define information that
 * is used to parameterize data-dependant widgets and control style and
 * behavior on UI interactions.
 *  

 ******************************************************************************/
/* Define variables :- that is your classified images, study_area/aoi etc

var studyarea: Table users/Boineelo_Moyo/StudyArea
var classfied_05: Image users/Boineelo_Moye/classified2005
var classfied_10: Image users/Boineelo_Moye/classified2010
var classfied_15: Image users/Boineelo_Moye/classified2015
var classfied_20: Image users/Boineelo_Moye/classified2020
var lst05: Image users/Boineelo_Moye/LST2005
var lst10: Image users/Boineelo_Moye/LST2010
var lst15: Image users/Boineelo_Moye/LST2015
var lst20: Image users/Boineelo_Moye/LST2020
 ******************************************************************************/
 
// Define a JSON object for storing the data model.
var m = {};


m.datasets = {
  'lulc': {
    coll: ee.ImageCollection([
      ee.Image('users/Boineelo_Moyo/classified2005').set('year', 2005), 
      ee.Image('users/Boineelo_Moyo/classified2010').set('year', 2010), 
      ee.Image('users/Boineelo_Moyo/classified2015').set('year', 2015).updateMask(ee.Image('users/Boineelo_Moyo/classified2015').neq(0)), 
      ee.Image('users/Boineelo_Moyo/classified2020').set('year', 2020).updateMask(ee.Image('users/Boineelo_Moyo/classified2020').neq(0)), 
    ]),
    vis: {
      min: 1,
      max: 6,
      palette: ["#42f132", "#81485c", "#117a17", "#54d4ff", "#f5deb7", "#cbe77e"]
    },
    classNames: ['Agric Lands','Built Up','Dense Vegetation',
            'Water', 'Bare Soil', 'Mixed Grassland']    
  }, 
  'lst': {
    coll: ee.ImageCollection([
      ee.Image('users/Boineelo_Moyo/LST2005').set('year', 2005), 
      ee.Image('users/Boineelo_Moyo/LST2010').set('year', 2010).clip(studyarea), 
      ee.Image('users/Boineelo_Moyo/LST2015').set('year', 2015), 
      ee.Image('users/Boineelo_Moyo/LST2020').set('year', 2020), 
    ]),
    vis: {
      min_constant: 25, max_constant: 43, 
      min2005:25, max2005:44,
      min2010:25, max2010:42,
      min2015:29, max2015:42,
      min2020:25, max2020:42,
      palette: ['blue', 'cyan', 'green', 'yellow', 'red']
    }
  },
  'lst_daily': {
    coll: ee.ImageCollection("MODIS/006/MOD11A2"),
    band: 'LST_Day_1km',
    startDate: '2004-11-01',
    endDate: '2020-11-01',
  },
  'aoi': {
    coll: ee.FeatureCollection("users/Boineelo_Moyo/StudyArea"), lon: 26, lat: -24.6518, zoom: 12
  }
};

m.years = ['2005', '2010', '2015', '2020'];
/*******************************************************************************
 * Components *
 *
 * A section to define the widgets that will compose your app.
 *
 * Guidelines:
 * 1. Except for static text and constraints, accept default values;
 *    initialize others in the initialization section.
 * 2. Limit composition of widgets to those belonging to an inseparable unit
 *    (i.e. a group of widgets that would make no sense out of order).
 ******************************************************************************/

// Define a JSON object for storing UI components.
