import baseAPI from './baseAPI'

export const getPatientData = () => baseAPI.get('/data').then((res) => res.data)
