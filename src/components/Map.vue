

<template>
  <div class="map">
    <h1>Mapa</h1>

  
  </div>
  <div class="row">
    <div class="col">
      <label for="city">Wybierz miasto:</label>
      <select v-model="city" @change="updateMapView" class="form-control">
        <option value="Rzeszów">Rzeszów</option>
        <option value="Lublin">Lublin</option>
        <option value="Kraków">Kraków</option>
        <option value="Przeworsk">Przeworsk</option>
        <option value="Stalowa Wola">Stalowa Wola</option>
      </select>
    </div>
    <div class="col">
      <label for="radius">Promień (km):</label>
      <input
        type="range"
        id="radius"
        v-model="radius"
        min="1"
        max="100"
        @input="updateMap"
        class="slider"
      />
      <span>{{ radius }} km</span>
    </div>
    <div class="row">
      <div class="col carriers-col">
        <label>Przewoźnicy:</label>
        <div class="carriers-list">
          <div v-for="carrier in carriers" :key="carrier.id">
            <input type="checkbox" :value="carrier.id" v-model="selectedCarriers" /> {{ carrier.name }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <button class="search-btn" @click="fetchStops">Szukaj</button>
    </div>
    <div>
      <div class="row">
        <div id="map" style="height: 500px;"></div>
      </div>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  data() {
    return {
      map: null,
      city: "",
      radius: 60,
      carriers: [],
      selectedCarriers: [],
      stops: [],
      selectedStop: null,
      circle: null,
      marker: null,
      markers: [],
      tooltip: {
        visible: false,
        stopId: null,
      },
    };
  },

  mounted() {
    this.initMap();
    this.fetchCarriers();
  },
  methods: {
  initMap() {
    this.map = L.map("map").setView([50.0413, 21.999], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on("click", this.onMapClick);
    this.map.on("moveend", this.updateMarkers);
   

    this.circle = L.circle([50.0413, 21.999], {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.1,
      radius: this.radius * 1000,
    }).addTo(this.map);
  },
  updateMap() {
    if (this.circle) {
      this.circle.setRadius(this.radius * 1000);
    }
    
  },
  async updateMapView() {
    const selectedCity = this.city;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${selectedCity}&format=json&limit=1`);
    const data = await response.json();
    
    if (data.length > 0) {
      const coordinates = [data[0].lat, data[0].lon];
      this.map.setView(coordinates, 12);
      
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.marker(coordinates).addTo(this.map);
      this.circle.setLatLng(coordinates);
    
    } else {

    }
  },
  async fetchCarriers() {
    try {
      const response = await fetch('https://w65569.eu.pythonanywhere.com/api/public/carriers/');
      const data = await response.json();
      this.carriers = data;
    } catch (error) {
      console.error('Błąd pobierania:', error);
    }
  },
  async fetchAllStops() {
    try {
      const response = await fetch('https://w65569.eu.pythonanywhere.com/api/public/stops/');
      const stops = await response.json();
     
    } catch (error) {
      console.error('Błąd pobierania:', error);
    }
  },
  async fetchStops() {
    try {  
      const cityCenter = this.circle.getLatLng(); 
      const radiusInMeters = this.radius * 1000;
      const carrierParams =  this.selectedCarriers.join(',');
      const response = await fetch(`https://w65569.eu.pythonanywhere.com/api/public/stops/nearby/?latitude=${cityCenter.lat}&longitude=${cityCenter.lng}&distance=${this.radius}&carriers=${carrierParams}`);
      const stops = await response.json();
   
      console.log('Przystanki na mapie:', stops); 
      
      if (Array.isArray(stops) && stops.every(stop => stop.latitude && stop.longitude)) {
        for (let stop of stops) {
        
          stop.timetables = await this.fetchTimetablesForStop(stop.id);
       
        }
        this.showStopsOnMap(stops);
        
      } else {
        console.error('Nieoczekiwany format danych:', stops);
      }    

    } catch (error) {
      console.error('Błąd pobierania przystanków:', error);
    }
    
  },

  async fetchTimetablesForStop(stopId){
    try {
      const response = await fetch(`https://w65569.eu.pythonanywhere.com/api/public/stops/${stopId}/timetables/`);
      const timetables = await response.json();
    
      console.log('Rozkłady jazdy dla przystanku:', timetables);
      return timetables;

    } catch (error) {
      console.error('Błąd pobierania rozkładów jazdy:', error);
      return [];
    }
  },
  onMapClick(e) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker(e.latlng).addTo(this.map);
    this.circle.setLatLng(e.latlng);
    this.fetchStops();
  },
  showStopsOnMap(stops) {
    if (!stops) {
      console.error('Dane przystanków są undefined');
      return;
    }

    stops.forEach(stop => {
      if (!stop) {
        console.error('Jeden z przystanków jest undefined');
        return;
      }

      const tooltipContent = this.createTooltipContent(stop);
    });
  
    console.log('Przystanki na mapie:', stops);
    // Remove previous markers
    if (this.markers) {
      this.markers.forEach(marker => this.map.removeLayer(marker));
    } else {
      this.markers = [];
    }

    const circleLatLng = this.circle.getLatLng();
    const circleRadius = this.circle.getRadius();
 

    if (!Array.isArray(stops)) {
    console.error('Nie ma przystanków w tablicy:', stops);
    return;
  }
    stops.forEach(stop => {
      const stopLatLng = L.latLng(stop.latitude, stop.longitude);
      const distance = circleLatLng.distanceTo(stopLatLng);
      const tooltipContent = this.createTooltipContent(stop);
      

      if (distance <= circleRadius && (this.selectedCarriers.length === 0 || stop.timetables.some(timetable => this.selectedCarriers.includes(timetable.carrier)))) {
        const marker = L.marker([stop.latitude, stop.longitude], { icon: this.createIcon() }).addTo(this.map);
        marker.bindTooltip(this.createTooltipContent(stop), { className: 'custom-tooltip'});
        marker.on("click", () => {
          this.showStopDetails(stop);
        });
        this.markers.push(marker);
      }
    });
  },

    createIcon() {
      return L.divIcon({
        className: "custom-div-icon",
        html: "<div style='background-color:blue;' class='marker-pin'></div>",
        iconSize: [15, 15],
        iconAnchor: [15, 15],
      });
    },

    
  createTooltipContent(stop) {
  if (!stop) {
    console.error('Nieprawidłowy obiekt przystanku:', stop);
    return '';
  }

  let content = `<h3>${stop.name}</h3>`;

  if (Array.isArray(stop.timetables) && stop.timetables.length > 0) {
    content += '<h4>Rozkład jazdy:</h4>';
    stop.timetables.forEach(timetable => {
      content += `<p>${timetable.day_type}: ${timetable.time}</p>`;
    });
  } else {
    content += '<p>Brak dostępnych rozkładów jazdy dla tego przystanku.</p>';
  }

  return content;
},
   

    showStopDetails(stop) {
      this.selectedStop = stop;
      console.log("Selected stop:", stop);
    },
  },
};
</script>

<style>

#map {
  height: 500px;
}
button {
  padding: 15px 30px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}
.carriers-list {
  display: flex;
  flex-direction: column;
}
.carriers-list div {
  display: flex;
  align-items: center;
}
.carriers-list input[type="checkbox"] {
  margin-right: 10px;
}
.slider {
  width: 60%;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}
.autocomplete {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.form-control {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  font-size: 16px;
}
.custom-div-icon .marker-pin {
  width: 30px;
  height: 42px;
  background-color: red;
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
.custom-tooltip {
  background: white;
  border: 1px solid black;
  padding: 10px;
  border-radius: 5px;
}



</style>
