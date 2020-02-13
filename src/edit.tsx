import * as React from 'react'
import * as ReactDOM from 'react-dom'

require('./styles.less')

class Root extends React.Component {

	render() {
		return <div>Hi!</div>
	}
}

miro.onReady(() => {
	ReactDOM.render(
		<Root/>,
		document.getElementById('react-app'),
	)
})
