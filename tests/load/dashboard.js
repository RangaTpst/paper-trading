import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 200,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<800'],  // dashboard doit répondre < 800ms
    http_req_failed: ['rate<0.01'],
  },
}

export default function () {
  // Chargement de la page principale
  const res = http.get('http://localhost:3000/')

  check(res, {
    'dashboard se charge (200)': (r) => r.status === 200,
    'temps de chargement < 800ms': (r) => r.timings.duration < 800,
  })

  sleep(0.5)
}
