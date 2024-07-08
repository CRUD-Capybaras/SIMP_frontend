<template>
  <div class="search">
    <h1>Wyszukiwanie</h1>
    <div class="form-group">
      <label for="carrier">Przewoźnik:</label>
      <select id="carrier" v-model="selectedCarrier" @change="fetchLines">
        <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
      </select>
    </div>
    
    <div class="form-group" v-if="lines.length > 0">
      <label for="line">Linia:</label>
      <select id="line" v-model="selectedLine" @change="fetchStops">
        <option v-for="line in lines" :key="line.id" :value="line.id">{{ line.name }}</option>
      </select>
    </div>
    
    <div class="form-group" v-if="stops.length > 0">
      <label for="stop">Przystanek:</label>
      <select id="stop" v-model="selectedStop" @change="fetchTimetables">
        <option v-for="stop in stops" :key="stop.id" :value="stop.id">{{ stop.name }}</option>
      </select>
    </div>
    
    <div class="timetables" v-if="timetables.length > 0">
      <div class="timetable" v-if="timetablesWeekday.length > 0">
        <h3>Dzień roboczy</h3>
        <ul>
          <li v-for="timetable in timetablesWeekday" :key="timetable.id">{{ timetable.time }}</li>
        </ul>
      </div>

      <div class="timetable" v-if="timetablesSaturday.length > 0">
        <h3>Sobota</h3>
        <ul>
          <li v-for="timetable in timetablesSaturday" :key="timetable.id">{{ timetable.time }}</li>
        </ul>
      </div>

      <div class="timetable" v-if="timetablesSundayHoliday.length > 0">
        <h3>Niedziela i święta</h3>
        <ul>
          <li v-for="timetable in timetablesSundayHoliday" :key="timetable.id">{{ timetable.time }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Search',
  data() {
    return {
      carriers: [],
      lines: [],
      stops: [],
      timetables: [],
      timetablesWeekday: [],
      timetablesSaturday: [],
      timetablesSundayHoliday: [],
      selectedCarrier: null,
      selectedLine: null,
      selectedStop: null,
    };
  },
  mounted() {
    this.fetchCarriers();
  },
  methods: {
    async fetchCarriers() {
      try {
        const response = await axios.get('https://w65569.eu.pythonanywhere.com/api/public/carriers/');
        this.carriers = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async fetchLines() {
      try {
        const response = await axios.get(`https://w65569.eu.pythonanywhere.com/api/public/carriers/${this.selectedCarrier}/lines/`);
        this.lines = response.data;
        this.stops = [];
        this.timetables = [];
        this.clearTimetables();
      } catch (error) {
        console.error(error);
      }
    },
    async fetchStops() {
      try {
        const response = await axios.get(`https://w65569.eu.pythonanywhere.com/api/public/lines/${this.selectedLine}/stops/`);
        this.stops = response.data;
        this.timetables = [];
        this.clearTimetables();
      } catch (error) {
        console.error(error);
      }
    },
    async fetchTimetables() {
      try {
        const response = await axios.get(`https://w65569.eu.pythonanywhere.com/api/public/stops/${this.selectedStop}/timetables/`);
        this.timetables = response.data;
        this.splitTimetables();
      } catch (error) {
        console.error(error);
      }
    },
    clearTimetables() {
      this.timetablesWeekday = [];
      this.timetablesSaturday = [];
      this.timetablesSundayHoliday = [];
    },
    splitTimetables() {
      this.clearTimetables();
      this.timetables.forEach(timetable => {
        switch (timetable.day_type) {
          case 'weekday':
            this.timetablesWeekday.push(timetable);
            break;
          case 'saturday':
            this.timetablesSaturday.push(timetable);
            break;
          case 'sunday_holiday':
            this.timetablesSundayHoliday.push(timetable);
            break;
        }
      });
    }
  }
};
</script>

<style scoped>
.search {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto; 
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

select {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.timetables {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.timetable {
  flex: 1;
  margin: 0 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.timetable h3 {
  margin-top: 0;
}

.timetable ul {
  list-style-type: none;
  padding: 0;
}

.timetable li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.timetable li:last-child {
  border-bottom: none;
}

</style>
