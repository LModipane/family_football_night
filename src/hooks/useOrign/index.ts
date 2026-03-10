
import { useEffect, useState } from 'react';

const useOrigin = () => {
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return null;

	const origin =
		typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

	return origin;
};

export default useOrigin
