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
var c = {};

// Define a control panel for user input.
c.controlPanel = ui.Panel();

// Define a series of panel widgets to be used as horizontal dividers.
c.dividers = {};
c.dividers.divider1 = ui.Panel();
c.dividers.divider2 = ui.Panel();


// Define 2 maps.
c.lulc_map = ui.Map();
c.lst_map = ui.Map();

// Link 2 maps to eachother.
c.linker = ui.Map.Linker([c.lulc_map, c.lst_map]);

// Define an app info widget group.
c.info = {};
c.info.titleLabel = ui.Label(
  'Spatio-Temporal Assessment of the impacts of LULC change on LST Variations in Gaborone'
  );
  
// Add subtitle label
c.info.subtitleLabel = ui.Label(
  'Discover the Changing Landscape of Gaborone ',
  {fontWeight: 'bold', fontSize: '16px'}
);

c.info.aboutLabel = ui.Label(
  'This app visualises the relationship between land use land cover (LULC) and Land Surface Temperature (LST) from 2005 to 2020, leveraging the Random Forest ML algorithm to achieve the results. \n' + 
  'The web application serves as a continuous monitoring, and spatio-temporal analysis tool for LULC and LST change patterns in Gaborone.\n' + 
  'Use the interactive swipping tool on the far left to explore and compare trends and changes in LULC and surface temperature shaped by urbanisation. \n' +
  'Perfect for researchers, planners, and anyone interested in the impacts of urban growth on local ecosystems. ',
  {whiteSpace: 'pre-wrap'}
  );
  
c.info.authorLabel = ui.Label('(Moyo Boineelo, MSc. Photogrammetry and Geoinformatics)')

c.info.panel = ui.Panel([
  c.info.titleLabel, 
  c.info.subtitleLabel,
  c.info.aboutLabel, 
  c.info.authorLabel
]);

// Define a data year selector widget group.
c.selectYear = {};
c.selectYear.label = ui.Label('Select a year to display');
c.selectYear.selector = ui.Select(m.years);
c.selectYear.panel = ui.Panel([c.selectYear.label, c.selectYear.selector]);

// Define chart widget group
c.charts = {};
c.charts.trendChartContainer = ui.Panel();  // will hold the dynamically generated chart.
c.charts.lulcChartContainer = ui.Panel();  // will hold the dynamically generated chart.
c.charts.panel = ui.Panel([c.charts.lulcChartContainer, c.charts.trendChartContainer]);


// Define a LST legend widget group.
c.lst_legend = {};
c.lst_legend.title = ui.Label('Temperature (°C) in Gaborone');
c.lst_legend.colorbar = ui.Thumbnail(ee.Image.pixelLonLat().select(0));
c.lst_legend.leftLabel = ui.Label('[min]');
c.lst_legend.centerLabel = ui.Label();
c.lst_legend.rightLabel = ui.Label('[max]');
c.lst_legend.labelPanel = ui.Panel({
  widgets: [
    c.lst_legend.leftLabel,
    c.lst_legend.centerLabel,
    c.lst_legend.rightLabel,
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});
c.lst_legend.panel = ui.Panel([
  c.lst_legend.title,
  c.lst_legend.colorbar,
  c.lst_legend.labelPanel
]);

// Define a LULC legend widget group.
c.lulc_legend = {};
c.lulc_legend.title = ui.Label('Classification Legend');
c.lulc_legend.panel = ui.Panel([
  c.lulc_legend.title,
]);

/*******************************************************************************
 * Composition *
 *
 * A section to compose the app i.e. add child widgets and widget groups to
 * first-level parent components like control panels and maps.
 *
 * Guidelines: There is a gradient between components and composition. There
 * are no hard guidelines here; use this section to help conceptually break up
 * the composition of complicated apps with many widgets and widget groups.
 ******************************************************************************/

c.controlPanel.add(c.info.panel);
c.controlPanel.add(c.dividers.divider1);
c.controlPanel.add(c.selectYear.panel);
c.controlPanel.add(c.dividers.divider2);
c.controlPanel.add(c.charts.panel);

c.lulc_map.add(c.lulc_legend.panel);
c.lst_map.add(c.lst_legend.panel);

//Create and style 1 row of the legend.
var makeRow = function(color, name) {
 
      var colorBox = ui.Label({
        style: {
          backgroundColor: color,
          padding: '8px',
          margin: '0 0 4px 4px'
        } 
      });
      
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });
 
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};

//Add color and names
// Loop through setting LULC class items.
for (var i in m.datasets.lulc.classNames) {
  c.lulc_legend.panel.add(makeRow(m.datasets.lulc.vis.palette[i], m.datasets.lulc.classNames[i]));
} 

// Create a SplitPanel which holds the linked maps side-by-side.
c.splitMapPanel = ui.SplitPanel({
  firstPanel: c.linker.get(1),
  secondPanel: c.linker.get(0),
  orientation: 'horizontal',
  wipe: true,
});

ui.root.clear();
ui.root.add(c.splitMapPanel);
ui.root.add(c.controlPanel);
/*******************************************************************************
 * Styling *
 *
 * A section to define and set widget style properties.
 *
 * Guidelines:
 * 1. At the top, define styles for widget "classes" i.e. styles that might be
 *    applied to several widgets, like text styles or margin styles.
 * 2. Set "inline" style properties for single-use styles.
 * 3. You can add multiple styles to widgets, add "inline" style followed by
 *    "class" styles. If multiple styles need to be set on the same widget, do
 *    it consecutively to maintain order.
 ******************************************************************************/

// Define a JSON object for defining CSS-like class style properties.
var s = {};

s.titleText = {
  fontSize: '20px', 
  fontWeight: 'bold', 
  color: 'green', 
  textAlign: "center"
};

s.aboutText = {
  fontSize: '15px', 
  textAlign: "justify"
};

s.authorText = {
    fontSize: '11px', 
    fontWeight: 'bold',
    textAlign: "justify",
    margin: '8px 8px 0px 8px',
  };
  
  
  s.widgetTitle = {
    fontSize: '15px',
    fontWeight: 'bold',
    margin: '8px 8px 0px 8px',
    color: '383838',
  };
  
  s.divider = {
    backgroundColor: 'green',
    height: '2px',
    margin: '20px 0px'
  };
  
  s.stretchHorizontal = {
    stretch: 'horizontal'
  };
  
  // Set widget style.
  c.info.titleLabel.style().set(s.titleText);
  c.info.aboutLabel.style().set(s.aboutText);
  c.info.authorLabel.style().set(s.authorText);
  
  
  c.selectYear.selector.style().set(s.stretchHorizontal);
  c.selectYear.label.style().set(s.widgetTitle);
  
  
  c.controlPanel.style().set({
    width: '400px',
    padding: '0px',
  });
  
  c.lulc_map.style().set({
    cursor: 'crosshair'
  });
  
  c.lst_map.style().set({
    cursor: 'crosshair'
  });
  
  c.splitMapPanel.style().set({
    stretch: 'both' 
  });
  
  // LST legend style
  c.lst_legend.title.style().set({
    fontWeight: 'bold',
    fontSize: '12px',
    color: '383838'
  });
  
  c.lst_legend.colorbar.style().set({
    stretch: 'horizontal',
    margin: '0px 8px',
    maxHeight: '20px'
  });
  
  c.lst_legend.colorbar.setParams({
      bbox: [0, 0, 1, 0.1],
      dimensions: '100x10',
      format: 'png',
      min: 0,
      max: 1,
      palette: m.datasets.lst.vis.palette
  });
  
  c.lst_legend.leftLabel.setValue(m.datasets.lst.vis.min_constant);
  c.lst_legend.rightLabel.setValue(m.datasets.lst.vis.max_constant);
  c.lst_legend.centerLabel.setValue((m.datasets.lst.vis.max_constant + m.datasets.lst.vis.min_constant) / 2);
  
  c.lst_legend.leftLabel.style().set({
    margin: '4px 8px',
    fontSize: '12px'
  });
  
  c.lst_legend.centerLabel.style().set({
    margin: '4px 8px',
    fontSize: '12px',
    textAlign: 'center',
    stretch: 'horizontal'
  });
  
  c.lst_legend.rightLabel.style().set({
    margin: '4px 8px',
    fontSize: '12px'
  });
  
  c.lst_legend.panel.style().set({
    position: 'bottom-left',
    width: '200px',
    padding: '0px'});
  

  // LULC legend style
  c.lulc_legend.title.style().set({
    fontWeight: 'bold',
    fontSize: '12px',
    color: '383838'
  });
  
  c.lulc_legend.panel.style().set({
    position: 'bottom-right',
    width: '200px',
    padding: '0px'});
    
  // Loop through setting divider style.
  Object.keys(c.dividers).forEach(function(key) {
    c.dividers[key].style().set(s.divider);
  });
  /*******************************************************************************
 * Behaviors *
 *
 * A section to define app behavior on UI activity.
 *
 * Guidelines:
 * 1. At the top, define helper functions and functions that will be used as
 *    callbacks for multiple events.
 * 2. For single-use callbacks, define them just prior to assignment. If
 *    multiple callbacks are required for a widget, add them consecutively to
 *    maintain order; single-use followed by multi-use.
 * 3. As much as possible, include callbacks that update URL parameters.
 ******************************************************************************/

// Handles year and band selection for new map layer display.
function updateLULCMap() {
    var year = c.selectYear.selector.getValue();
    
    var studyarea = m.datasets.aoi.coll;
    var lulc_img = m.datasets.lulc.coll.filter(ee.Filter.eq('year', parseInt(year, 10))).first().clip(studyarea);
    var lulc_layer = ui.Map.Layer(lulc_img, m.datasets.lulc.vis, 'LULC ' + year);
  
    c.lulc_map.layers().set(1, lulc_layer);
  }
  
  function updateLSTMap() {
    
    var year = c.selectYear.selector.getValue();
    var min_vis = m.datasets.lst.vis['min' + year];
    var max_vis = m.datasets.lst.vis['max' + year];
    var palette = m.datasets.lst.vis.palette;
    
    var lst_img = m.datasets.lst.coll.filter(ee.Filter.eq('year', parseInt(year, 10)));
    var lst_layer = ui.Map.Layer(lst_img, {min: min_vis, max: max_vis, palette: palette}, 'LST ' + year);
  
    c.lst_map.layers().set(1, lst_layer);
  }
  
  function updateLinkedMaps() {
    updateLULCMap();
    updateLSTMap();
  }
  
  // // Handles drawing the legend when band selector changes.
  // function updateLSTLegend(year) {
    
  //   var min_vis = m.datasets.lst.vis['min' + year];
  //   var max_vis = m.datasets.lst.vis['max' + year];
  //   var mean_vis = (min_vis + max_vis) / 2;
    
  //   c.lst_legend.leftLabel.setValue(min_vis);
  //   c.lst_legend.centerLabel.setValue(mean_vis);
  //   c.lst_legend.rightLabel.setValue(max_vis);
  // }
  
  function drawTrendChart() {
    // Filter the LST collection to include only images intersecting the desired date range.
    var modis = m.datasets.lst_daily.coll;
    var mod11a2 = modis.filterDate(m.datasets.lst_daily.startDate, m.datasets.lst_daily.endDate);
    var modLSTday = mod11a2.select(m.datasets.lst_daily.band);
    
    // Scale to Kelvin and convert to Celsius, set image acquisition time.
    var modLSTc = modLSTday.map(function(img) {
      return img
        .multiply(0.02)
        .subtract(273.15)
        .copyProperties(img, ['system:time_start']);
    });
    
/*******************************************************************************
 * Initialize *
 * 
 * A section to initialize the app state on load.
 *
 * Guidelines:
 * 1. At the top, define any helper functions.
 * 2. As much as possible, use URL params to initial the state of the app.
 ******************************************************************************/
 
    
    // Chart time series of LST for Gaborone in 2015.
    var trendChart = ui.Chart.image.series({
      imageCollection: modLSTc,
      region: m.datasets.aoi.coll,
      reducer: ee.Reducer.mean(), 
      scale: 1000,
      xProperty: 'system:time_start'})
      .setOptions({
        lineWidth: 1,
        pointSize: 2,
        trendlines: {0: { 
            color: 'CC0000'
        }},
        legend: {position: 'none'},
         title: 'Gaborone LST Time Series (2005 - 2020)',
         hAxis: {title: ' Years'},
         vAxis: {title: 'LST Celsius'}});
    c.charts.trendChartContainer.widgets().reset([trendChart]);
  }
  
  function drawLULCChart(year) {
    var lulc_img = m.datasets.lulc.coll.filter(ee.Filter.eq('year', parseInt(year, 10))).first();
    
    var chart = ui.Chart.image.byClass({
      image: ee.Image.pixelArea().divide(1e6).rename('area').addBands(lulc_img), 
      classBand: 'b1', 
      region: m.datasets.aoi.coll, 
      reducer: ee.Reducer.sum(), 
      scale: m.datasets.lulc.coll.first().projection().nominalScale(), 
      classLabels: [''].concat(m.datasets.lulc.classNames),
    }).setOptions({
        title: 'Class distribution for year ' + year,
        colors: m.datasets.lulc.vis.palette,
        hAxis: {title: 'LULC Classes'},
        vAxis: {title: 'Area Km^2'},
        });
    c.charts.lulcChartContainer.widgets().reset([chart]);
  }
  
  c.selectYear.selector.onChange(updateLinkedMaps);
  // c.selectYear.selector.onChange(updateLSTLegend);
  c.selectYear.selector.onChange(drawLULCChart);
  