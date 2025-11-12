// src/data/reportData.js

export const kpiData = [
  { title: "Total Ticket Sales", value: 12540, change: "+12%", icon: "🎟️" },
  { title: "Total Revenue", value: "₺245,000", change: "+18%", icon: "💸" },
  { title: "Active Users", value: 3420, change: "+5%", icon: "👥" },
  { title: "Films Showing", value: 25, change: "", icon: "🎞️" },
  { title: "Average Rating", value: 4.3, change: "", icon: "⭐" },
];

export const trendData = [
  { month: "Jan", tickets: 4000, revenue: 80000 },
  { month: "Feb", tickets: 3000, revenue: 60000 },
  { month: "Mar", tickets: 5000, revenue: 95000 },
  { month: "Apr", tickets: 6500, revenue: 120000 },
  { month: "May", tickets: 7000, revenue: 130000 },
  { month: "Jun", tickets: 6800, revenue: 125000 },
];

export const citySales = [
  { city: "Istanbul", tickets: 2500 },
  { city: "Ankara", tickets: 1800 },
  { city: "Izmir", tickets: 1500 },
  { city: "Bursa", tickets: 900 },
  { city: "Antalya", tickets: 700 },
];

export const genreDistribution = [
  { name: "Action", value: 30 },
  { name: "Comedy", value: 25 },
  { name: "Drama", value: 20 },
  { name: "Sci-Fi", value: 15 },
  { name: "Other", value: 10 },
];

export const filmPerformance = [
  { title: "Dune: Part Two", tickets: 2400, revenue: "₺96,000", rating: 4.8 },
  {
    title: "Joker: Folie à Deux",
    tickets: 1800,
    revenue: "₺81,000",
    rating: 4.6,
  },
  { title: "Inside Out 2", tickets: 1300, revenue: "₺52,000", rating: 4.5 },
];
