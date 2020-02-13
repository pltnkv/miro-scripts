import * as React from 'react'
import * as ReactDOM from 'react-dom'
import IScript from 'IScripts'
import * as firebase from 'firebase'
// import 'firebase/firestore'
import {firebaseConfig} from 'config'

require('./edit.less')

type IState = {
	scripts: IScript[]
	currentScript: IScript
}

const newScript: IScript = {
	title: 'New script',
	content: 'alert(Hi!)',
	sharingPolicy: 'personal',
	creatorId: '',
	teamId: '',
}

class Root extends React.Component {

	state: IState = {
		scripts: [],
		currentScript: newScript,
	}

	private firebase: any = firebase.initializeApp(firebaseConfig)
	private db: any = firebase.firestore()

	async componentWillMount() {
		const state = await miro.__getRuntimeState()
		const userId = await miro.currentUser.getId()
		const teamId = (await miro.account.get()).id

		newScript.creatorId = userId
		newScript.teamId = teamId

		this.setState({
			mode: 'create', //scriptId ? 'edit' : 'create',
			scripts: [newScript, ...state.scripts],
		})
	}

	private onScriptSelect(s: IScript) {
		this.setState({
			...this.state,
			currentScript: s,
		})
	}

	onSave() {

		if (this.state.currentScript === newScript) {
			//create new
			let scriptRef = this.db.collection('scripts').doc()
			scriptRef.set(newScript)
				.then(() => {
					miro.showNotification('Script has been created')
					miro.board.ui.closeModal()
				})
				.catch(() => {miro.showErrorNotification('Can\'t save script')})
		} else {
			//edit
			let scriptRef = this.db.collection('scripts').doc(this.state.currentScript.id)
			scriptRef.set({})
				.then(() => {
					miro.showNotification('Saved')
					miro.board.ui.closeModal()
				})
				.catch(() => {miro.showErrorNotification('Can\'t save script')})
		}
	}

	onDelete() {
		// let scriptRef = this.db.collection('scripts').doc(scriptId)
		// scriptRef.delete()
		// 	.then(() => {miro.board.ui.closeModal()})
		// 	.catch(() => {miro.showErrorNotification('Can\'t delete script')})
	}

	onTitleChange = (e: any) => {
		this.setState({
			currentScript: {
				...this.state.currentScript,
				title: e.target.value,
			},
		})
	}

	onContentChange = (e: any) => {
		this.setState({
			currentScript: {
				...this.state.currentScript,
				content: e.target.value,
			},
		})
	}

	render() {
		const getBlockClass = (s: IScript) => {
			let cssClasses = s.id === '' ? 'edit-script-block new-script-block' : 'edit-script-block'
			if (this.state.currentScript === s) {
				cssClasses += ' selected'
			}
			return cssClasses
		}
		const scriptBlocks = this.state.scripts.map(s => <div key={s.id} className={getBlockClass(s)} onClick={() => this.onScriptSelect(s)}>{s.title}</div>)

		return <div>
			<div className='header'>{scriptBlocks}</div>
			<div>
				<input value={this.state.currentScript.title} onChange={this.onTitleChange}/>
				<textarea value={this.state.currentScript.content} onChange={this.onContentChange}></textarea>
			</div>
			<button onClick={() => this.onSave()}>Save</button>
			{/*{this.state.mode === 'edit' ? <button onClick={this.onDelete}>Delete</button> : null}*/}
		</div>
	}
}

miro.onReady(() => {
	ReactDOM.render(
		<Root/>,
		document.getElementById('react-app'),
	)
})
