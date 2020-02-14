import {EDIT_WIDTH} from 'config'

const icon24 = '<path d="M6 2a1 1 0 1 1 0 2 2 2 0 0 0-1.995 1.85L4 6v4c0 .769-.29 1.47-.765 2 .476.53.765 1.232.765 2v4a2 2 0 0 0 2 2 1 1 0 0 1 0 2 4 4 0 0 1-4-4v-4a1 1 0 0 0-1-1 1 1 0 0 1 0-2l.117-.007a1 1 0 0 0 .876-.876L2 10V6a4 4 0 0 1 4-4zm12 0a4 4 0 0 1 4 4v4a1 1 0 0 0 1 1 1 1 0 0 1 .117 1.993L23 13a1 1 0 0 0-1 1v4a4 4 0 0 1-4 4 1 1 0 0 1 0-2 2 2 0 0 0 2-2v-4c0-.768.289-1.47.764-2A2.989 2.989 0 0 1 20 10V6a2 2 0 0 0-2-2 1 1 0 0 1 0-2zM7.5 14a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 14a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="currentColor" fill-rule="evenodd"></path>'

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
