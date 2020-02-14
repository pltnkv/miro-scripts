import * as React from 'react'
import * as ReactDOM from 'react-dom'
import IScript from 'IScripts'
import * as firebase from 'firebase'
import {firebaseConfig} from 'config'

require('./sidebar.less')

firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()

type IState = {
	scripts: IScript[]
	currentFilter: string
}

class Root extends React.Component {

	state: IState = {
		scripts: [],
		currentFilter: 'all',
	}

	async componentDidMount() {
		const userId = await miro.currentUser.getId()
		const teamId = (await miro.account.get()).id
		const scriptsRef = db.collection('scripts')

		const personalScripts = await scriptsRef.where('creatorId', '==', userId).get()
		const teamScripts = await scriptsRef
		//Impl NOT expr. https://firebase.google.com/docs/firestore/query-data/queries#query_limitations
			.where('creatorId', '<', userId)
			.where('creatorId', '>', userId)
			.where('teamId', '==', teamId).get()

		const scripts: IScript[] = []
		personalScripts.forEach((sRef: any) => {
			scripts.push({
				...sRef.data(),
				id: sRef.id,
			})
		})
		teamScripts.forEach((sRef: any) => {
			scripts.push({
				...sRef.data(),
				id: sRef.id,
			})
		})

		this.setState({
			scripts,
		})
		miro.__setRuntimeState({
			scripts,
			userId,
			teamId,
		})
	}

	updateState = async () => {
		const newState = await miro.__getRuntimeState()
		this.setState({
			scripts: newState.scripts,
			currentFilter: 'all',
		})
	}

	async manageScripts() {
		await miro.board.ui.openModal('edit.html', {width: 1000, height: 700})
		this.updateState()
	}

	runScript(s: IScript) {
		try {
			eval(s.content)
		} catch (e) {
			console.error(e)
			miro.showErrorNotification(`There is some error in '${s.title}' script`)
		}
	}

	selectFilter(filter: string) {
		this.setState({
			currentFilter: filter,
		})
	}

	render() {
		const scriptBlocks = this.state.scripts
			.filter(s => {
				return this.state.currentFilter === 'personal' && s.sharingPolicy === 'none'
					|| this.state.currentFilter === 'team' && s.sharingPolicy === 'team'
					|| this.state.currentFilter === 'all'
			})
			.map(s =>
				<div key={s.id}
					 className="script-block"
					 style={{backgroundColor: s.color}}
					 onClick={() => this.runScript(s)}>
					{s.title}
				</div>,
			)

		return <div>
			<h1>Scripts</h1>
			<div className="filters">
				<span className={this.state.currentFilter === 'all' ? 'selected' : ''} onClick={() => this.selectFilter('all')}>All</span>
				<span className={this.state.currentFilter === 'personal' ? 'selected' : ''} onClick={() => this.selectFilter('personal')}>Personal</span>
				<span className={this.state.currentFilter === 'team' ? 'selected' : ''} onClick={() => this.selectFilter('team')}>Team</span>
				<span className="settings-button" onClick={() => this.manageScripts()}>Manage</span>
			</div>
			<div className="scripts-list">
				{scriptBlocks}
			</div>
		</div>
	}
}

miro.onReady(() => {
	ReactDOM.render(
		<Root/>,
		document.getElementById('react-app'),
	)
})
