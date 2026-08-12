import { error } from '@sveltejs/kit';
import { byId } from '$lib/agents/registry';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const agent = byId(params.id);
	if (!agent) error(404, 'Agent not found');
	return { agent };
};
