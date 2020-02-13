import * as copy from 'copy-to-clipboard'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import SVG from 'react-inlinesvg'
import IScript from 'IScripts'

require('./styles.less')
const SquareIcon = require('images/square.svg')
const PlayIcon = require('images/play.svg')
const LinkIcon = require('images/link.svg')
const ArrowIcon = require('images/arrow.svg')
const hotspotPreview = `data:image/svg+xml,%3Csvg width='152' height='66' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Crect stroke='null' x='0' y='0' fill-opacity='0.5' fill='%232d9bf0' height='140' width='140'/%3E%3C/g%3E%3C/svg%3E`

type IState = {
	personalScripts: IScript[]
	teamScripts: IScript[]
}

class Root extends React.Component {

	private containerRef: any = React.createRef()

	state: IState = {
		personalScripts: [],
		teamScripts: [],
	}

	componentDidMount(): void {
		//load data from FB
		this.setState({
			personalScripts: [
				{
					id:'1',
					title: 'Say hello!',
					description: '...',
					content: 'alert("hello")',
					sharingPolicy: 'personal',
					creatorId: '',
					teamId: '',
				},
			],
			teamScripts: [
				{
					id:'2',
					title: 'Team script 1',
					description: '...',
					content: 'alert("hello 1")',
					sharingPolicy: 'team',
					creatorId: '',
					teamId: '',
				},
				{
					id:'3',
					title: 'Team script 2',
					description: '...',
					content: 'alert("hello 2")',
					sharingPolicy: 'team',
					creatorId: '',
					teamId: '',
				},
			],
		})
	}

	addScript() {
		miro.board.ui.openModal('edit.html')
	}

	editScript(s:IScript) {
		miro.board.ui.openModal(`edit.html?id=${s.id}`)
	}

	runScript(s: IScript) {
		eval(s.content)
		//todo add wrapper with onMiroScriptComplete() method
	}

	render() {

		const personalScripts = this.state.personalScripts.map(s => <div key={s.id}>
			{s.title}
			<button onClick={() => this.runScript(s)}>run</button>
			<button onClick={() => this.editScript(s)}>edit</button>
		</div>)
		const teamScripts = this.state.teamScripts.map(s => <div key={s.id}>
			{s.title}
			<button onClick={() => this.runScript(s)}>run</button>
			<button onClick={() => this.editScript(s)}>edit</button>
		</div>)

		const view = <div>
			<h1>Scripts</h1>
			<div className="scripts-list">
				<h3>personal</h3>
				{personalScripts}
			</div>
			<div className="scripts-list">
				<h3>team</h3>
				{teamScripts}
			</div>
			<button onClick={this.addScript}>+ Script</button>
		</div>

		return <div ref={this.containerRef}>{view}</div>
	}
}

miro.onReady(() => {
	ReactDOM.render(
		<Root/>,
		document.getElementById('react-app'),
	)
})
