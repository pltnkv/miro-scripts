import getDB from 'db'
import IScript from 'IScripts'

export enum EventName {
	ScriptCreated = 'script_created',
	ScriptEdited = 'script_edited',
	ScriptDeleted = 'script_deleted',
	ScriptRunned = 'script_runned'
}

export function sendScriptEvent(options: {eventName: EventName; script:IScript; userId: string; teamId: string}) {
	getDB().collection('events').add(options)
}
