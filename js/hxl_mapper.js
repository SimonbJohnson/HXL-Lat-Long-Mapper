function init(){
    $('#loaddata').on("click",function(){insertDemoData();});
    $('#submit').on("click",function(){submit();});
    $('#tab2').hide();
    $('#map').height($( window ).height()-100);
}

function insertDemoData(){
    $('#hxlinput').html(demoData);
    $('#title').val('Ebola Medical Centres');
}

function submit(){
    $('#tab1').hide();
    $('#tab2').show();
    map.invalidateSize();
    processData($('#hxlinput').val());
}

function mapInit(){


    var base_hotosm = L.tileLayer(
        'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{
        attribution: '&copy; OpenStreetMap contributors, <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap Team</a>'}
    );

    var map = L.map('map', {
        center: [0, 0],
        zoom: 4,
        layers: [base_hotosm]
    });
    return map;
}

function processData(data){
    var results = Papa.parse(data);
    var hxlRowLatLon= findHXLTagRow(results);
    if(hxlRowLatLon.row>-1){
        if(hxlRowLatLon.row>0){
            hxlRowLatLon.head=hxlRowLatLon.row-1;
        } else {
            hxlRowLatLon.head=hxlRowLatLon.row;
        }
        var filters = getFilters(results.data[hxlRowLatLon.head],
                hxlRowLatLon.lat,hxlRowLatLon.lon);
        addMarkersToMap(results.data,hxlRowLatLon,filters);        
        $('#map_title').html($('#title').val());
        constructFilterDropDown(filters);
    } else {
        console.log("error: no hxl row");
    }
}

function addMarkersToMap(data,hxl,filters){
    for(i = hxl.row+1; i < data.length; i++){
        var popup = "";
        $.each(data[i],function(i,e){
            popup = popup + "<b>" + data[hxl.head][i] +":</b> "+e+"<br />";
        });
        var marker = L.circleMarker([data[i][hxl.lat], data[i][hxl.lon]],{
            radius: 5,
            fillColor: "#ff7800",
            color: "#ff7800",
            opacity: 1,
            fillOpacity: 1
        }).bindPopup(popup);

        marker.hxlData = dataForMarker(data[i],filters,hxl.lat,hxl.lon);
        console.log(marker);
        markers.push(marker);

    }
    console.log(markers);
    var group = new L.featureGroup(markers).addTo(map);
    console.log("check2");
    map.fitBounds(group.getBounds());
}

function findHXLTagRow(results){
    var hxlrow=-1;
    var latcol=0;
    var loncol=0;    
    $.each(results.data,function(i,e){
        var latcount=0;
        var loncount=0;
        
        $.each(e,function(i,ee){
            if(ee.substring(0,4)==="#lat"){
                latcount++;
                latcol=i;
            }
            if(ee.substring(0,4)==="#lon"){
                loncount++;
                loncol=i;
            }            
        });
        if(latcount===1&&loncount===1){
            hxlrow=i;
        }
    });
    return {row:hxlrow,lat:latcol,lon:loncol};
}

function getFilters(data,lat,lon){
    var filters=[];
    $.each(data,function(i,e){
        if(i!==lat&&i!==lon){filters.push(escape(e));}
    });
    return filters;
}

function constructFilterDropDown(filter){
    var html = "<select id='filter_select'><option value='none'>None</option>";
    $.each(filter,function(i,e){
       html=html+"<option value='"+e+"'>"+unescape(e)+"</option>"; 
    });
    html = html+"</select>";
    $("#filter_dropdown").html(html);
    $("#filter_select").change(function(){
        colorMarkers($("#filter_select").val());
    });
}

function dataForMarker(data,filters,lat,lon){
    var d={};
    var count=0;
    $.each(data,function(i,e){
        if(i!==lat && i!==lon){
            d[filters[count]] = escape(e);
            count++;
        }
    });
    return d;
}

function colorMarkers(filter){    
    var categories = {};
    var count = 0;
    var legend = "<h4>Legend</h4>";
    $.each(markers,function(i,e){
        var cat = e.hxlData[filter];
        console.log(e);
        if(categories[e.hxlData[filter]]!== undefined && categories[e.hxlData[filter]]!==null){
            e.setStyle({fillColor: categories[cat], color:categories[cat]});
        } else {
            categories[cat] = colors[count];
            count++;
            e.setStyle({fillColor: categories[cat], color:categories[cat]});
            legend=legend + "<p><div class='legendbox' style='background-color:"+categories[cat]+";'></div> "+unescape(cat)+"</p>";
        }
    });
    if(filter==="none"){legend="<h4>Legend</h4>";}
    $('#legendtext').html(legend);
}

init();
var markers=[];
var map = mapInit();
    var colors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
    "#9edae5",
    "#aec7e8",
    "#ffbb78",
    "#98df8a",
    "#ff9896",
    "#c5b0d5",
    "#c49c94",
    "#f7b6d2",
    "#c7c7c7",
    "#dbdb8d"    
];
