// Shared MongoDB connection for Netlify functions.
// Set MONGODB_URI (and optionally MONGODB_DB) in Netlify > Site settings > Environment variables.
import { MongoClient } from 'mongodb'

let clientPromise

export function collection(name) {
  if (!process.env.MONGODB_URI) return null
  clientPromise ??= new MongoClient(process.env.MONGODB_URI).connect()
  return clientPromise.then((c) => c.db(process.env.MONGODB_DB || 'crafts_junkiee').collection(name))
}

export const json = (body, status = 200) => Response.json(body, { status })
