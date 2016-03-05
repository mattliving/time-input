var zeroPad = require('./zero-pad')
var getGroups = require('./get-groups')
var getBase = require('./get-base')
var stringify = require('./stringify')
var toggle24Hr = require('./toggle-24-hour')
var isTwelveHourTime = require('./is-twelve-hour-time')

module.exports = function adder (str, groupId, amount) {
  var groups = getGroups(str)
  var twelveHourTime = isTwelveHourTime(groups)
  if (twelveHourTime && groupId === groups.length - 1) return stringify(toggle24Hr(groups))
  return stringify(add(groups, groupId, amount, twelveHourTime))
}

function add (groups, groupId, amount, twelveHourTime) {
  var base = getBase(groupId, twelveHourTime)
  if (!groupId && groups[groupId] === '12') groups[groupId] = '00'
  var val = Number(groups[groupId]) + amount
  groups = replace(groups, groupId, (val + base) % base)
  if (groupId && val >= base) return add(groups, groupId - 1, 1, twelveHourTime)
  if (groupId && val < 0) return add(groups, groupId - 1, -1, twelveHourTime)
  if (!groupId && twelveHourTime) {
    if (val >= base || val < 0) toggle24Hr(groups)
    if (groups[0] === '00') groups[0] = '12'
  }
  return groups
}

function replace (groups, groupId, amount) {
  var digits = groups[groupId].length
  groups[groupId] = zeroPad(String(amount), digits)
  return groups
}