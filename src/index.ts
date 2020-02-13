import {EDIT_WIDTH} from 'config'

const icon24 = '<path fill="none" stroke="currentColor" stroke-width="2" d="M3 3h18v18H3z"></path>'

miro.onReady(async () => {
	miro.initialize({
		extensionPoints: {
			bottomBar: {
				title: 'Scripts',
				svgIcon: icon24,
				onClick: () => {
					miro.board.ui.openLeftSidebar('sidebar.html', {width: EDIT_WIDTH})
				},
			},
		},
	})
})
