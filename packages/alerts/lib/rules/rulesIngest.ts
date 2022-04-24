import _ from "lodash"
import runRules from "./rulesEngine"

export default async function rulesIngest(data:any){
  // group data by id and sort by timestamp then run through rulesEngine

  if(!data.length) {
    return
  }
  let [res] = await Promise.all(data.map(runRules))
  return res
}