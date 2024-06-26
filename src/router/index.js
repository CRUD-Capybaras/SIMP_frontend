import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Map from '../components/Map.vue';
import Search from '../components/Search.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/mapa',
        name: 'Map',
        component: Map
    },
    {
        path: '/wyszukiwanie',
        name: 'Search',
        component: Search
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
