import * as React from 'react'
import * as ReactDOM from 'react-dom'
import IScript from 'IScripts'

require('./edit.less')

type IState = {
	mode: string | undefined,
	scripts: IScript[]
	currentScript: IScript | undefined
}

class Root extends React.Component {

	state: IState = {
		mode: undefined, //'new' | 'edit'
		scripts: [],
		currentScript: undefined
	}

	async componentWillMount() {
		const state = await miro.__getRuntimeState()

		this.setState({
			mode: 'create', //scriptId ? 'edit' : 'create',
			scripts: state.scripts
		})
		console.log(state.scripts)
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
				{/*<textarea defaultValue={this.state.script!.content}></textarea>*/}
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
