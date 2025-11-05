// src/helpers/axios-setup.js
import axios from "axios";
import { config } from "@/helpers/config";

axios.defaults.baseURL = config.apiURL;
axios.defaults.withCredentials = true; // cookie'leri otomatik gönder
