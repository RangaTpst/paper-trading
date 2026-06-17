import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('errors')
const priceLatency = new Trend('price_latency')

export const options = {
  scenarios: {
    // Scénario 1 : charge normale (100 users en parallèle)
    charge_normale: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30s',
    },
    // Scénario 2 : montée en charge progressive
    montee_en_charge: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 50 },
        { duration: '20s', target: 200 },
        { duration: '10s', target: 0 },
      ],
      startTime: '35s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% des requêtes < 500ms
    errors: ['rate<0.01'],             // moins de 1% d'erreurs
    price_latency: ['p(99)<1000'],     // 99% < 1 seconde
  },
}

export default function () {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']
  const symbol = symbols[Math.floor(Math.random() * symbols.length)]

  const start = Date.now()
  const res = http.get(`http://localhost:3000/api/price?symbol=${symbol}`)
  priceLatency.add(Date.now() - start)

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'price est un nombre': (r) => {
      try {
        const body = JSON.parse(r.body)
        return typeof body.price === 'number' && !isNaN(body.price)
      } catch {
        return false
      }
    },
    'symbol présent': (r) => {
      try {
        return JSON.parse(r.body).symbol === symbol
      } catch {
        return false
      }
    },
  })

  errorRate.add(!ok)
  sleep(0.1)
}
