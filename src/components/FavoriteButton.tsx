'use client';

import type { JSX } from 'react';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
    isFavorite: boolean;
    onToggle: () => void;
}

export default function FavoriteButton({
                                           isFavorite,
                                           onToggle,
                                       }: FavoriteButtonProps): JSX.Element {
    return (
        <button
            onClick={onToggle}
            className={`${styles.button} ${isFavorite ? styles.favorite : ''}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            {isFavorite ? '★' : '☆'}
        </button>
    );
}