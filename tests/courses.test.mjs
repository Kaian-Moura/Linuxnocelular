import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {courses,filterCourses} from '../src/lib/courses.mjs';
test('biblioteca combina filtros e não trata ausência de curso como compatibilidade',()=>{
  assert.equal(filterCourses().length,courses.length);
  assert.ok(filterCourses({query:'compilacao'}).some(item=>item.id==='cpp'));
  assert.ok(filterCourses({query:'COMPILAÇÃO'}).some(item=>item.id==='cpp'));
  assert.deepEqual(filterCourses({goal:'electronics',environment:'termux'}),[]);
  assert.deepEqual(filterCourses({query:'aula que não existe'}),[]);
  const result=filterCourses({goal:'maintenance',level:'beginner',environment:'native'});
  assert.ok(result.some(item=>item.id==='git'));
  assert.ok(result.every(item=>item.goal==='maintenance'&&item.level==='beginner'&&item.environments.includes('native')));
});
test('catálogo tem IDs únicos e requisitos sem links para cursos inexistentes',()=>{
  assert.equal(new Set(courses.map(item=>item.id)).size,courses.length);
  for(const item of courses) {
    assert.ok(item.prerequisite&&item.result);
    const stem=item.href.slice(1,-1);
    assert.ok([`${stem}.md`,`${stem}.mdx`].some(name=>existsSync(new URL(`../${name}`,import.meta.url))),item.href);
  }
});
