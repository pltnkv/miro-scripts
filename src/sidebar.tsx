import * as copy from 'copy-to-clipboard'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import SVG from 'react-inlinesvg'
import IScript from 'IScripts'
import * as firebase from "firebase/app";
import "firebase/firestore";
import {firebaseConfig} from 'config';

require('./sidebar.less')
const SquareIcon = require('images/square.svg')
const PlayIcon = require('images/play.svg')
const LinkIcon = require('images/link.svg')
const ArrowIcon = require('images/arrow.svg')
const hotspotPreview = `data:image/svg+xml,%3Csvg width='152' height='66' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Crect stroke='null' x='0' y='0' fill-opacity='0.5' fill='%232d9bf0' height='140' width='140'/%3E%3C/g%3E%3C/svg%3E`

type IState = {
	scripts: IScript[]
	currentFilter: string
}

class Root extends React.Component {

	private containerRef: any = React.createRef()
	private firebase: any = firebase.initializeApp(firebaseConfig)
	private db: any =  firebase.firestore();

	state: IState = {
		scripts: [],
		currentFilter: 'all',
	}

	async componentDidMount(): void {
		const userId = await miro.currentUser.getId()
		const teamId = (await miro.account.get()).id
		const scriptsRef = this.db.collection('scripts');
		const result  = Promise.all([
			scriptsRef.where('creatorId', '==', userId).get(),
			scriptsRef.where('teamId', '==', teamId).get(),
		]);
		let loadedScripts: Array<any> = [];


		result.then((collection) => {
			collection.forEach((innerCollection) => {
				innerCollection.forEach((doc) => {
					loadedScripts.push(doc.data());
				});
			});
		});

		this.setState({
			scripts: loadedScripts,
		})
		miro.__setRuntimeState({
			scripts: loadedScripts,
		})
	}

	addScript() {
		miro.board.ui.openModal('edit.html', {fullscreen: true})
	}

	editScript(s: IScript) {
		miro.board.ui.openModal(`edit.html?id=${s.id}`, {fullscreen: true})
	}

	runScript(s: IScript) {
		eval(s.content)
		//todo add wrapper with onMiroScriptComplete() method
	}

	selectFilter(filter: string) {
		this.setState({
			currentFilter: filter,
		})
	}

	render() {

		// const personalScripts = this.state.personalScripts.map(s => <div key={s.id}>
		// 	{s.title}
		// 	<button onClick={() => this.runScript(s)}>run</button>
		// 	<button onClick={() => this.editScript(s)}>edit</button>
		// </div>)
		// const teamScripts = this.state.teamScripts.map(s => <div key={s.id}>
		// 	{s.title}
		// 	<button onClick={() => this.runScript(s)}>run</button>
		// 	<button onClick={() => this.editScript(s)}>edit</button>
		// </div>)

		const view = <div>
			<h1>Scripts</h1>
			<div className="filters">
				<span className={this.state.currentFilter === 'all' ? 'selected' : ''} onClick={() => this.selectFilter('all')}>All</span>
				<span className={this.state.currentFilter === 'personal' ? 'selected' : ''} onClick={() => this.selectFilter('personal')}>Personal</span>
				<span className={this.state.currentFilter === 'team' ? 'selected' : ''} onClick={() => this.selectFilter('team')}>Team</span>
				<span className="settings-button" onClick={this.addScript}>Manage</span>
			</div>
			<div className="scripts-list">
				<div className="script-block">Grid widgets</div>
				<div className="script-block">Create table</div>
				<div className="script-block">Import spreadsheet</div>
				<div className="script-block">Adjust stickers size</div>
			</div>
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
