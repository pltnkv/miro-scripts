import * as React from 'react'
import * as ReactDOM from 'react-dom'
import IScript from 'IScripts'
import * as firebase from 'firebase/app'
import {firebaseConfig} from 'config'

require('./edit.less')

firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()

type IState = {
	creatorId: string
	hidden: boolean //hack — no blink when create script
	scripts: IScript[]
	currentScript: IScript
	currentScriptModified: boolean
}

function gerRandomColor(): string {
	const colors = ['#cb7a2a', '#cba32a', '#a3cb2a', '#52cb2a', '#2acba3', '#2a7acb', '#522acb', '#a32acb', '#cb2aa3', '#cb2a52']
	return colors[Math.round(Math.random() * (colors.length - 1))]
}

const newScript: IScript = {
	id: 'new-id',
	title: 'New script',
	content: 'alert(\'Hi!\')',
	sharingPolicy: 'none',
	creatorId: '',
	teamId: '',
	color: gerRandomColor(),
}

class Root extends React.Component {

	state: IState = {
		creatorId: '',
		hidden: false,
		scripts: [],
		currentScript: newScript,
		currentScriptModified: false,
	}

	async componentWillMount() {
		const state = await miro.__getRuntimeState()

		newScript.creatorId = state.userId
		newScript.teamId = state.teamId

		this.setState({
			creatorId: state.userId,
			scripts: state.scripts,
		})
	}

	private onScriptSelect(s: IScript) {
		if (this.state.currentScript !== newScript && this.state.currentScriptModified) {
			this.onSave(false)
		}
		this.setState({
			...this.state,
			currentScript: s,
			currentScriptModified: false,
		})
	}

	private async dispatchScriptsUpdated() {
		await miro.__setRuntimeState({
			scripts: this.state.scripts,
		})
	}

	onCreate() {
		miro.showNotification('Creating...')
		db.collection('scripts').add(newScript)
			.then(async (docRef) => {
				newScript.id = docRef.id
				this.setState({
					hidden: true,
					currentScript: newScript,
					scripts: this.state.scripts.filter(s => s.id !== this.state.currentScript.id),
				})
				miro.showNotification('Script has been created')
				this.setState({
					scripts: [...this.state.scripts, newScript],
				}, async () => {
					await this.dispatchScriptsUpdated()
					miro.board.ui.closeModal()
				})

			})
			.catch(() => {
				miro.showErrorNotification('Can\'t create script')
			})
	}

	onSave(close = true) {
		miro.showNotification('Saving...')
		let scriptRef = db.collection('scripts').doc(this.state.currentScript.id)
		let scriptTitle = this.state.currentScript.title
		scriptRef.set(this.state.currentScript)
			.then(async () => {
				miro.showNotification(`Script '${scriptTitle}' has been saved`)
				await this.dispatchScriptsUpdated()
				if (close) {
					miro.board.ui.closeModal()
				}
			})
			.catch(() => {
				miro.showErrorNotification('Can\'t save script')
			})
	}

	onDelete() {
		miro.showNotification('Deleting...')
		let scriptTitle = this.state.currentScript.title
		let scriptRef = db.collection('scripts').doc(this.state.currentScript.id)
		scriptRef.delete()
			.then(async () => {
				miro.showNotification(`Script '${scriptTitle}' has been deleted`)
				this.setState({
					currentScript: newScript,
					scripts: this.state.scripts.filter(s => s.id !== this.state.currentScript.id),
				}, () => this.dispatchScriptsUpdated())
			})
			.catch(() => {miro.showErrorNotification('Can\'t delete script')})
	}

	onTitleChange = (e: any) => {
		this.state.currentScript.title = e.target.value
		this.setState({
			currentScript: this.state.currentScript,
			currentScriptModified: true,
		})
	}

	onContentChange = (e: any) => {
		this.state.currentScript.content = e.target.value
		this.setState({
			currentScript: this.state.currentScript,
			currentScriptModified: true,
		})
	}

	onColorChange = (e: any) => {
		this.state.currentScript.color = e.target.value
		this.setState({
			currentScript: this.state.currentScript,
			currentScriptModified: true,
		})
	}

	onSharingClick = (p: string) => {
		this.state.currentScript.sharingPolicy = p
		this.setState({
			currentScript: this.state.currentScript,
			currentScriptModified: true,
		})
	}

	render() {
		if (this.state.hidden) {
			return null
		}

		const scriptsWithNew = [newScript, ...this.state.scripts]
		const scriptBlocks = scriptsWithNew.map(s => {
			return <div key={s.id}
						className={this.getBlockClass(s)}
						style={{backgroundColor: s === newScript ? 'transparent' : s.color}}
						onClick={() => this.onScriptSelect(s)}>{s.title}</div>
		})
		return <div>
			<div className='header'>{scriptBlocks}</div>
			<div>
				<input className="script-title miro-input miro-input--primary miro-input--small"
					   placeholder="Enter script title"
					   value={this.state.currentScript.title}
					   onChange={this.onTitleChange}/>

				<input className="color-picker" type="color" value={this.state.currentScript.color} onChange={this.onColorChange}/>

				<textarea
					placeholder="// write some code here"
					value={this.state.currentScript.content}
					onChange={this.onContentChange}></textarea>
			</div>
			{this.state.currentScript.creatorId === this.state.creatorId ? this.getCheckboxesView() : null}
			{this.getButtonsView()}
		</div>
	}

	private getCheckboxesView() {
		return <div className="sharing-policy">
			<label className="miro-radiobutton">
				<input type="radio"
					   value="0"
					   name="radio"
					   checked={this.state.currentScript.sharingPolicy !== 'team'}
					   onClick={() => this.onSharingClick('none')}/><span>Personal usage</span>
			</label>
			<label className="miro-radiobutton">
				<input type="radio"
					   value="1"
					   name="radio"
					   checked={this.state.currentScript.sharingPolicy === 'team'}
					   onClick={() => this.onSharingClick('team')}/><span>Shared for team</span>
			</label>
		</div>
	}

	private getBlockClass = (s: IScript) => {
		let cssClasses = s === newScript ? 'edit-script-block new-script-block' : 'edit-script-block'
		if (this.state.currentScript === s) {
			cssClasses += ' selected'
		}
		return cssClasses
	}

	private getButtonsView = () => {
		if (this.state.currentScript === newScript) {
			return <div className="buttons">
				<button className="miro-btn miro-btn--primary miro-btn--small" onClick={() => this.onCreate()}>Create</button>
			</div>
		} else {
			return <div className="buttons">
				<button className="miro-btn miro-btn--primary miro-btn--small" onClick={() => this.onSave()}>Save</button>
				<button className="miro-btn miro-btn--danger miro-btn--small" onClick={() => this.onDelete()}>Delete</button>
			</div>
		}
	}
}

miro.onReady(() => {
	ReactDOM.render(
		<Root/>,
		document.getElementById('react-app'),
	)
})
