import _ from "lodash"
import runRules from "./rulesEngine"

export default function rulesIngest(data:any){
  // group data by id and sort by timestamp then run through rulesEngine
  const groupedData = _.groupBy(data, 'id')
  const sortedData = _.map(groupedData, (group) => {
    return _.sortBy(group, 'timestamp')
  })
  Object.keys(sortedData).map(data => runRules(data))
}