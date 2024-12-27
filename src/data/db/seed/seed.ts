import 'reflect-metadata';
import Container from 'typedi';
import { Seed } from './define-seed';

Container.get(Seed).seedDb();
console.log('Seed finished successfully!');
