import * as React from 'react'
import * as ReactDOM from 'react-dom'
import IScript from 'IScripts'
import {EventName, sendScriptEvent} from 'stats'
import getDB from 'db'

require('./edit.less')

type IState = {
	userId: string
	teamId: string
	teamTitle: string
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
	description: '',
	content: 'alert(\'Hi!\')',
	sharingPolicy: 'none',
	creatorId: '',
	teamId: '',
	color: gerRandomColor(),
}

class Root extends React.Component {

	state: IState = {
		userId: '',
		teamId: '',
		teamTitle: '',
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
			userId: state.userId,
			teamId: state.teamId,
			teamTitle: state.teamTitle,
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
		getDB().collection('scripts').add(newScript)
			.then(async (docRef) => {
				newScript.id = docRef.id
				this.setState({
					hidden: true,
					currentScript: newScript,
					scripts: this.state.scripts.filter(s => s.id !== this.state.currentScript.id),
				})
				sendScriptEvent({eventName: EventName.ScriptCreated, script: newScript, userId: this.state.userId, teamId: this.state.teamId})
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
		const script = this.state.currentScript
		let scriptRef = getDB().collection('scripts').doc(script.id)
		scriptRef.set(this.state.currentScript)
			.then(async () => {
				miro.showNotification(`Script '${script.title}' has been saved`)
				sendScriptEvent({eventName: EventName.ScriptEdited, script, userId: this.state.userId, teamId: this.state.teamId})
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
		const script = this.state.currentScript
		let scriptRef = getDB().collection('scripts').doc(script.id)
		scriptRef.delete()
			.then(async () => {
				miro.showNotification(`Script '${script.title}' has been deleted`)
				sendScriptEvent({eventName: EventName.ScriptDeleted, script, userId: this.state.userId, teamId: this.state.teamId})
				this.setState({
					currentScript: newScript,
					scripts: this.state.scripts.filter(s => s.id !== script.id),
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

	onDescriptionChange = (e: any) => {
		this.state.currentScript.description = e.target.value
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
					   maxLength={100}
					   value={this.state.currentScript.title}
					   onChange={this.onTitleChange}/>

				<input className="color-picker" type="color" value={this.state.currentScript.color} onChange={this.onColorChange}/>

				<textarea
					className="description"
					placeholder="Briefly describe how to use this script"
					maxLength={300}
					value={this.state.currentScript.description || ''}
					onChange={this.onDescriptionChange}></textarea>

				<textarea
					className="code"
					placeholder="// write some code here"
					value={this.state.currentScript.content}
					onChange={this.onContentChange}></textarea>
			</div>
			{
				this.state.currentScript.creatorId === this.state.userId
					? this.getCheckboxesView()
					: <p>This script created by other team member</p>
			}
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
					   onClick={() => this.onSharingClick('none')}/><span>Personal usage across your teams</span>
			</label>
			<label className="miro-radiobutton">
				<input type="radio"
					   value="1"
					   name="radio"
					   checked={this.state.currentScript.sharingPolicy === 'team'}
					   onClick={() => this.onSharingClick('team')}/><span>Shared for <i>{this.state.teamTitle}</i> team</span>
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
				{
					this.state.currentScript.creatorId === this.state.userId
						? <button className="miro-btn miro-btn--danger miro-btn--small" onClick={() => this.onDelete()}>Delete</button>
						: null
				}

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
