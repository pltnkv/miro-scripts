import * as React from 'react'
import * as ReactDOM from 'react-dom'
import IScript from 'IScripts'
import getDB from 'db'
import {EventName, sendScriptEvent} from 'stats'

require('./sidebar.less')

type IState = {
	loaded: boolean
	scripts: IScript[]
	currentFilter: Filter,
	userId: string
	teamId: string
}

enum Filter {
	ALL = 'all',
	PERSONAL = 'personal',
	TEAM = 'team'
}

const EmptyFilterText = {
	[Filter.ALL]: `There are no scripts yet. <br>Click 'Manage' to create one.`,
	[Filter.PERSONAL]: `You have no personal scripts. <br>Click 'Manage' to create one.`,
	[Filter.TEAM]: `No scripts has been shared for this team yet. <br>Click 'Manage' to create one.`,
}

class Root extends React.Component {

	state: IState = {
		loaded: false,
		scripts: [],
		currentFilter: Filter.ALL,
		userId: '',
		teamId: '',
	}

	async componentDidMount() {
		const team = await miro.account.get()
		const userId = await miro.currentUser.getId()
		const teamId = team.id

		const personalScriptsRequest = getDB().collection('scripts')
			.where('sharingPolicy', '==', 'none')
			.where('creatorId', '==', userId).get()

		const teamScriptsRequest = getDB().collection('scripts')
			.where('sharingPolicy', '==', 'team')
			.where('teamId', '==', teamId).get()

		const personalScripts = await personalScriptsRequest
		const teamScripts = await teamScriptsRequest

		const scripts: IScript[] = []
		teamScripts.forEach((sRef: any) => {
			scripts.push({
				...sRef.data(),
				id: sRef.id,
			})
		})
		personalScripts.forEach((sRef: any) => {
			if (!scripts.some(s => s.id === sRef.id)) {
				scripts.push({
					...sRef.data(),
					id: sRef.id,
				})
			}
		})

		this.setState({
			userId,
			teamId,
			scripts,
			loaded: true,
		})
		miro.__setRuntimeState({
			scripts,
			userId,
			teamId,
			teamTitle: team.title,
		})
	}

	updateState = async () => {
		const newState = await miro.__getRuntimeState()
		this.setState({
			scripts: newState.scripts,
			currentFilter: Filter.ALL,
		})
	}

	async manageScripts() {
		await miro.board.ui.openModal('edit.html', {width: 1000, height: 760})
		this.updateState()
	}

	runScript(s: IScript) {
		try {
			eval(`(async () => { ${s.content} })()`)
		} catch (e) {
			console.error(e)
			miro.showErrorNotification(`There is some error in '${s.title}' script`)
		}
		sendScriptEvent({eventName: EventName.ScriptRunned, script: s, userId: this.state.userId, teamId: this.state.teamId})
	}

	selectFilter(filter: string) {
		this.setState({
			currentFilter: filter,
		})
	}

	render() {
		const scripts = this.state.scripts.filter(s => {
			return this.state.currentFilter === Filter.PERSONAL && s.sharingPolicy === 'none'
				|| this.state.currentFilter === Filter.TEAM && s.sharingPolicy === 'team'
				|| this.state.currentFilter === Filter.ALL
		})

		const scriptsBlock = scripts.map(s =>
			<div key={s.id}
				 className="script-block"
				 title={s.description || 'No description :('}
				 style={{backgroundColor: s.color}}
				 onClick={() => this.runScript(s)}>
				{s.title}
			</div>,
		)

		const getHint = () => {
			return {
				__html: EmptyFilterText[this.state.currentFilter],
			}
		}

		if (!this.state.loaded) {
			return null
		}

		return <div>
			<h1>Scripts</h1>
			<div className="filters">
				<span className={this.state.currentFilter === Filter.ALL ? 'selected' : ''} onClick={() => this.selectFilter('all')}>All</span>
				<span className={this.state.currentFilter === Filter.PERSONAL ? 'selected' : ''} onClick={() => this.selectFilter('personal')}>Personal</span>
				<span className={this.state.currentFilter === Filter.TEAM ? 'selected' : ''} onClick={() => this.selectFilter('team')}>Team</span>
				<span className="settings-button" onClick={() => this.manageScripts()}>Manage</span>
			</div>
			<div className="scripts-list">
				{
					scripts.length > 0
						? scriptsBlock
						: <div className="hint" dangerouslySetInnerHTML={getHint()}></div>
				}
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
