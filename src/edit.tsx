import * as React from 'react'
import * as ReactDOM from 'react-dom'
import IScript from 'IScripts'

require('./styles.less')

type IState = {
	mode: string | undefined,
	script: IScript
}

class Root extends React.Component {

	state: IState = {
		mode: undefined, //'new' | 'edit'
		script: undefined!,
	}

	async componentWillMount() {
		const url = new URL(window.location.href)
		const scriptId = url.searchParams.get('id')
		let script = undefined

		if (scriptId) {
			// load script and set to 'script' var
			script = {
				id: '1',
				title: 'Say hello!',
				description: '...',
				content: 'alert("hello")',
				sharingPolicy: 'personal',
				creatorId: '',
				teamId: '',
			}
		} else {
			script = {
				id: '',
				title: 'New Script',
				description: '...',
				content: 'alert("new script")',
				sharingPolicy: 'personal',
				creatorId: '',
				teamId: '',
			}
		}

		this.setState({
			mode: scriptId ? 'edit' : 'create',
			script: script,
		})
	}

	onSave() {
		//todo save to FB
		miro.board.ui.closeModal()
	}

	onDelete() {
		//todo delete in FB
		miro.board.ui.closeModal()
	}

	render() {
		return <div>
			<h1>{this.state.mode === 'edit' ? 'Edit script' : 'Create script'}</h1>
			<div>
				<textarea defaultValue={this.state.script!.content}></textarea>
			</div>
			<button onClick={this.onSave}>Save</button>
			{this.state.mode === 'edit'? <button onClick={this.onDelete}>Delete</button> : null}
		</div>
	}
}

miro.onReady(() => {
	ReactDOM.render(
		<Root/>,
		document.getElementById('react-app'),
	)
})
