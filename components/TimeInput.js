var React = require('react')
var isTwelveHourTime = require('../lib/is-twelve-hour-time')
var replaceCharAt = require('../lib/replace-char-at')
var getGroupId = require('../lib/get-group-id')
var getGroups = require('../lib/get-groups')
var adder = require('../lib/time-string-adder')
var caret = require('../lib/caret')
var validate = require('../lib/validate')

var TimeInput = React.createClass({
  getInitialState () {
    return {}
  },
  getDefaultProps () {
    return {
      value: '12:00:00:000 AM',
      defaultValue: '12:00:00:000 AM',
      twelveHourTime: true
    }
  },
  propTypes: {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    twelveHourTime: React.PropTypes.bool,
    defaultValue: React.PropTypes.string
  },
  render () {
    return (
      <div className='TimeInput'>
        <input
          className='TimeInput-input'
          ref={(input) => { this.input = input }}
          type='text'
          size={this.props.value.length - 1}
          value={this.format(this.props.value)}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
        />
      </div>
    )
  },
  format (val) {
    if (isTwelveHourTime(val)) val = val.replace(/^00/, '12')
    return val.toUpperCase()
  },
  componentDidUpdate () {
    var index = this.state.caretIndex
    if (index || index === 0) caret.set(this.input, index)
  },
  handleBlur () {
    if (this.isMounted()) this.setState({ caretIndex: null })
  },
  handleTab (event) {
    var start = caret.start(this.input)
    var value = this.props.value
    var groups = getGroups(value)
    var groupId = getGroupId(start)
    if (event.shiftKey) {
      if (!groupId) return
      groupId--
    } else {
      if (groupId >= (groups.length - 1)) return
      groupId++
    }
    event.preventDefault()
    var index = groupId * 3
    if (this.props.value.charAt(index) === ' ') index++
    if (this.isMounted()) this.setState({ caretIndex: index })
  },
  handleArrows (event) {
    event.preventDefault()
    var start = caret.start(this.input)
    var value = this.props.value
    var amount = event.which === 38 ? 1 : -1
    if (event.shiftKey) {
      amount *= 10
      if (event.metaKey) amount *= 10
    }
    value = adder(value, getGroupId(start), amount)
    this.onChange(value, start)
  },
  handleBackspace (event) {
    event.preventDefault()
    var defaultValue = this.props.defaultValue
    var start = caret.start(this.input)
    var value = this.props.value
    var end = caret.end(this.input)
    var diff = end - start
    if (!diff) {
      if (value[start - 1] === ':') start--
      value = replaceCharAt(value, start - 1, defaultValue.charAt(start - 1))
      start--
    } else {
      while (diff--) {
        if (value[end - 1] !== ':') {
          value = replaceCharAt(value, end - 1, defaultValue.charAt(end - 1))
        }
        end--
      }
    }
    this.onChange(value, start)
  },
  handleForwardspace (event) {
    event.preventDefault()
    var defaultValue = this.props.defaultValue
    var start = caret.start(this.input)
    var value = this.props.value
    var end = caret.end(this.input)
    var diff = end - start
    if (!diff) {
      if (value[start] === ':') start++
      value = replaceCharAt(value, start, defaultValue.charAt(start))
      start++
    } else {
      while (diff--) {
        if (value[end - 1] !== ':') {
          value = replaceCharAt(value, start, defaultValue.charAt(start))
        }
        start++
      }
    }
    this.onChange(value, start)
  },
  handleKeyDown (event) {
    if (event.which === 9) return this.handleTab(event)
    if (event.which === 38 || event.which === 40) return this.handleArrows(event)
    if (event.which === 8) return this.handleBackspace(event)
    if (event.which === 46) return this.handleForwardspace(event)
  },
  isSeparator (char) {
    return /[:\s]/.test(char)
  },
  handleChange (event) {
    var newValue = this.input.value
    var value = this.props.value
    var diff = newValue.length - value.length
    var end = caret.start(this.input)
    var insertion
    event.preventDefault()
    if (diff > 0) {
      var start = end - diff
      insertion = newValue.slice(end - diff, end)
      while (diff--) {
        var oldChar = value.charAt(start)
        var newChar = insertion.charAt(0)
        if (this.isSeparator(oldChar)) {
          if (this.isSeparator(newChar)) {
            insertion = insertion.slice(1)
            start++
          } else {
            start++
            diff++
            end++
          }
        } else {
          value = replaceCharAt(value, start, newChar)
          insertion = insertion.slice(1)
          start++
        }
      }
      newValue = value
    }
    if (validate(newValue)) {
      this.onChange(newValue, end)
    } else {
      var caretIndex = this.props.value.length - (newValue.length - end)
      if (this.isMounted()) this.setState({ caretIndex: caretIndex })
    }
  },
  onChange: function (str, caretIndex) {
    if (this.props.onChange) this.props.onChange(this.format(str))
    if (this.isMounted() && typeof caretIndex === 'number') this.setState({ caretIndex: caretIndex })
  }
})

module.exports = TimeInput
